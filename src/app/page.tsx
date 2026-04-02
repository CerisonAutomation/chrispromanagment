"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowUp,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  ExternalLink,
  FilePlus,
  FileText,
  GripVertical,
  ImageIcon,
  LayoutGrid,
  LogOut,
  Menu,
  MoreVertical,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageRenderer, getBlockTypeList, getBlockDefaults } from "@/lib/block-renderer";
import { defaultPages } from "@/lib/default-pages";
import type { BlockData, BlockItem, PageListItem } from "@/lib/block-types";
import { createEmptyBlockData } from "@/lib/block-types";
import MediaLibrary from "@/components/cms/media-library";
import MaltaSVGLoader from "@/components/malta-svg-loader";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

import { LOGO_URL } from "@/lib/images";
import { SITE_BASE, NAV_LINKS, PAGE_META, ADMIN_AUTH, SITE_NAME } from "@/lib/constants";

// ============================================================
// ADMIN AUTH
// ============================================================
function isAdminAuthenticated(): boolean {
  try {
    const auth = sessionStorage.getItem(ADMIN_AUTH.storageKey);
    const time = parseInt(sessionStorage.getItem(ADMIN_AUTH.timeKey) || "0", 10);
    if (!auth || auth !== "true") return false;
    if (Date.now() - time > ADMIN_AUTH.sessionDurationMs) {
      sessionStorage.removeItem(ADMIN_AUTH.storageKey);
      sessionStorage.removeItem(ADMIN_AUTH.timeKey);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function loginAdmin(password: string): boolean {
  if (password === ADMIN_AUTH.demoPassword) {
    sessionStorage.setItem(ADMIN_AUTH.storageKey, "true");
    sessionStorage.setItem(ADMIN_AUTH.timeKey, Date.now().toString());
    return true;
  }
  return false;
}

function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_AUTH.storageKey);
  sessionStorage.removeItem(ADMIN_AUTH.timeKey);
}

function updateCanonicalAndMeta(slug: string) {
  try {
    const canonical = slug === "home" ? SITE_BASE : SITE_BASE + "/#" + slug;
    const linkEl = document.querySelector("link[rel=canonical]");
    if (linkEl) { (linkEl as HTMLElement).setAttribute("href", canonical); }
    else { const lk = document.createElement("link"); lk.rel = "canonical"; lk.href = canonical; document.head.appendChild(lk); }
    const m = PAGE_META[slug];
    if (m) { document.title = m.title; }
  } catch { /* non-critical */ }
}

// ============================================================
// HASH ROUTER HOOK
// ============================================================
function useHashRouter() {
  const [route, setRoute] = useState(() =>
    typeof window !== "undefined" ? window.location.hash || "#/home" : "#/home"
  );

  useEffect(() => {
    const initialSlug = (route.replace(/^#\/?/, "") || "home").split("/")[0];
    updateCanonicalAndMeta(initialSlug);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || "#/home");
      window.scrollTo({ top: 0 });
      const slug = ((window.location.hash || "#/home").replace(/^#\/?/, "") || "home").split("/")[0];
      updateCanonicalAndMeta(slug);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
    window.scrollTo({ top: 0 });
  }, []);

  return { route, navigate };
}

// ============================================================
// ROUTE PARSER
// ============================================================
function parseRoute(hash: string):
  | { type: "editor"; slug: string }
  | { type: "admin"; slug: "" }
  | { type: "page"; slug: string } {
  const clean = hash.replace(/^#\/?/, "") || "home";
  if (clean.startsWith("admin/edit/")) {
    return { type: "editor", slug: clean.replace("admin/edit/", "") };
  }
  if (clean === "admin") {
    return { type: "admin", slug: "" };
  }
  return { type: "page", slug: clean };
}

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================
function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-[100] h-[2px]"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    >
      <div
        className="h-full rounded-r-full transition-[width] duration-100 ease-out"
        style={{
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, var(--cpm-accent), var(--cpm-accent-hover), transparent)",
        }}
      />
    </div>
  );
}

// ============================================================
// SCROLL REVEAL
// ============================================================
function getPrefersReduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ScrollReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(() => getPrefersReduced());
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (getPrefersReduced()) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : "translateY(24px)",
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// BACK-TO-TOP BUTTON
// ============================================================
function BackToTopButton({ scrollPercent }: { scrollPercent: number }) {
  const [visible, setVisible] = useState(false);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  }, [prefersReduced]);

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      title="Back to top"
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 flex h-11 w-11 flex-col items-center justify-center rounded-full border border-cpm-accent/30 text-cpm-accent shadow-lg shadow-cpm-accent/10 transition-all duration-300 hover:border-cpm-accent/60 hover:bg-cpm-accent/15 hover:text-cpm-accent-hover hover:shadow-xl hover:shadow-cpm-accent/20 active:scale-[0.95]"
    >
      <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
      <span className="mt-[-2px] text-[9px] font-semibold leading-none">
        {Math.round(scrollPercent)}%
      </span>
    </button>
  );
}

// ============================================================
// SKELETON LOADER
// ============================================================
function PageSkeleton({ pageName }: { pageName: string }) {
  const [skeletonVisible, setSkeletonVisible] = useState(false);

  // Delay skeleton cascade so it appears after the map finishes drawing
  useEffect(() => {
    const t = setTimeout(() => setSkeletonVisible(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{ background: "radial-gradient(ellipse at 50pct 40pct, rgba(200,169,106,0.03) 0pct, transparent 65pct)" }}
      />

      <div className="relative flex flex-col items-center">

        <div
          className="relative z-10 mb-5"
          style={{ animation: "logoBreath 2.8s ease-in-out infinite" }}
        >
          <img
            src={LOGO_URL}
            alt="Christiano Property Management"
            className="mx-auto h-11 w-auto opacity-80 sm:h-13"
            style={{ filter: "drop-shadow(0 0 12px rgba(200,169,106,0.15))" }}
          />
        </div>


        <div
          className="relative z-10 mb-5 h-px w-16"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(200,169,106,0.5), transparent)",
          }}
          aria-hidden="true"
        />


        <MaltaSVGLoader
          label={pageName}
          sizeClass="w-48 h-32 sm:w-64 sm:h-44 md:w-72 md:h-48"
          drawDuration={2000}
          fillDelay={200}
        />


        <p
          className="relative z-10 mt-5 text-xs font-medium uppercase tracking-[0.2em] transition-opacity duration-1000"
          style={{ color: "rgba(154,150,144,0.6)" }}
        >
          {pageName}
        </p>
      </div>

      {/* Content-aware skeleton cascade */
      <div
        className="relative z-10 mt-14 w-full max-w-3xl space-y-5"
        style={{
          opacity: skeletonVisible ? 1 : 0,
          transform: skeletonVisible
            ? "translateY(0)"
            : "translateY(16px)",
          transition:
            "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >

        <div
          className="rounded-xl"
          style={{
            height: "200px",
            width: "100%",
            background:
              "linear-gradient(135deg, rgba(21,23,27,0.8), rgba(27,30,35,0.8))",
            backgroundSize: "200% 100%",
            animation:
              "shimmer 2.2s ease-in-out infinite",
            animationDelay: "0s",
            border: "1px solid rgba(27,30,35,0.6)",
          }}
        />


        <div
          className="rounded-md"
          style={{
            height: "14px",
            width: "55%",
            margin: "0 auto",
            background:
              "linear-gradient(90deg, rgba(27,30,35,0.8) 25%, rgba(42,45,51,0.8) 50%, rgba(27,30,35,0.8) 75%)",
            backgroundSize: "200% 100%",
            animation:
              "shimmer 2.2s ease-in-out infinite",
            animationDelay: "0.15s",
          }}
        />


        <div className="mx-auto w-4/5 space-y-3">
          {["90%", "75%", "40%"].map((w, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                height: "10px",
                width: w,
                background:
                  "linear-gradient(90deg, rgba(27,30,35,0.8) 25%, rgba(42,45,51,0.8) 50%, rgba(27,30,35,0.8) 75%)",
                backgroundSize: "200% 100%",
                animation:
                  "shimmer 2.2s ease-in-out infinite",
                animationDelay: `${0.3 + i * 0.12}s`,
              }}
            />
          ))}
        </div>


        <div className="grid grid-cols-3 gap-4 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="space-y-2.5 rounded-lg p-3"
              style={{
                background: "rgba(21,23,27,0.5)",
                border: "1px solid rgba(27,30,35,0.5)",
                animation: `fadeInUp 0.6s ease-out ${0.5 + i * 0.15}s both`,
              }}
            >
              <div
                className="h-20 w-full rounded-md"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(27,30,35,0.8), rgba(42,45,51,0.6))",
                  backgroundSize: "200% 100%",
                  animation:
                    "shimmer 2.2s ease-in-out infinite",
                  animationDelay: `${0.6 + i * 0.1}s`,
                }}
              />
              <div className="space-y-1.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: "70%",
                    background: "rgba(27,30,35,0.8)",
                  }}
                />
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: "45%",
                    background: "rgba(27,30,35,0.5)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LOGIN SCREEN
// ============================================================
function LoginScreen({
  onLogin,
}: {
  onLogin: () => void;
  targetRoute: string;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password.trim()) return;
      setLoading(true);
      setError("");
      await new Promise((r) => setTimeout(r, 400));
      if (loginAdmin(password)) {
        toast.success("Signed in to CMS");
        onLogin();
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
        inputRef.current?.focus();
      }
      setLoading(false);
    },
    [password, onLogin]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-cpm-bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src={LOGO_URL}
            alt="Christiano Property Management"
            className="mx-auto mb-4 h-12 w-auto"
          />
          <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
          <h1 className="text-xl font-light text-cpm-text-primary">
            CMS Administration
          </h1>
          <p className="mt-1 text-sm text-cpm-text-tertiary">
            Sign in to manage your website content
          </p>
        </div>
        <div className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label
                htmlFor="admin-password"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-cpm-text-secondary"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter admin password"
                  className="h-11 border-cpm-border bg-cpm-bg-primary pr-10 text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:border-cpm-accent/50 focus:ring-cpm-accent/20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cpm-text-tertiary hover:text-cpm-text-secondary transition-colors"
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading || !password.trim()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cpm-accent text-sm font-semibold text-cpm-bg-primary transition-all hover:bg-cpm-accent-hover active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cpm-bg-primary/30 border-t-cpm-bg-primary" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Sign In to CMS
                </>
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowPassword(true)}
              className="text-xs text-cpm-text-tertiary transition-colors hover:text-cpm-text-secondary"
            >
              Forgot password?
            </button>
            {showPassword && (
              <div className="mt-2 rounded-lg border border-cpm-accent/20 bg-cpm-accent/5 px-3 py-2 text-xs text-cpm-accent">
                <span className="font-medium">Demo password:</span>{" "}
                cpm-admin-2024
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              window.location.hash = "#/home";
            }}
            className="text-xs text-cpm-text-tertiary transition-colors hover:text-cpm-accent"
          >
            &larr; Back to website
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TEMPLATE DATA HELPER
// ============================================================
function getTemplateData(template: string): BlockData {
  if (template === "blank") {
    return createEmptyBlockData("New Page");
  }
  const def = defaultPages[template];
  if (def) return def.data;
  return createEmptyBlockData("New Page");
}

// ============================================================
// NAVIGATION BAR
// ============================================================
function NavBar({
  currentPage,
  onNavigate,
}: {
  currentPage: string;
  onNavigate: (slug: string) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > 100) {
        setNavScrolled(true);
        if (current > lastScrollY.current + 5) {
          setNavVisible(false);
          setMobileOpen(false);
        } else if (current < lastScrollY.current - 5) {
          setNavVisible(true);
        }
      } else {
        setNavScrolled(false);
        setNavVisible(true);
      }
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        mobileOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  const handleNav = useCallback(
    (slug: string) => {
      setMobileOpen(false);
      onNavigate(slug);
    },
    [onNavigate]
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ease-out ${
        navScrolled
          ? "border-cpm-border/80 bg-cpm-bg-primary/95 shadow-lg shadow-black/20"
          : "border-cpm-border/60 bg-cpm-bg-primary/85"
      } backdrop-blur-xl ${
        navVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <button onClick={() => handleNav("home")} className="shrink-0">
            <img
              src={LOGO_URL}
              alt="Christiano"
              className="h-9 w-auto object-contain transition-opacity hover:opacity-80"
            />
          </button>
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.slug}
                onClick={() => handleNav(link.slug)}
                className={`relative rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  currentPage === link.slug
                    ? "text-cpm-accent"
                    : "text-cpm-text-secondary hover:text-cpm-text-primary"
                }`}
              >
                {link.label}
                {currentPage === link.slug && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-cpm-accent" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav("book")}
            className="flex items-center gap-1.5 rounded-lg bg-cpm-accent px-4 py-2 text-xs font-semibold text-cpm-bg-primary transition-all duration-200 hover:bg-cpm-accent-hover hover:shadow-[0_0_20px_rgba(200,169,106,0.3)] active:scale-[0.97]"
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Book Now</span>
          </button>
          <button
            ref={buttonRef}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex items-center justify-center rounded-lg border border-cpm-border px-2.5 py-1.5 text-cpm-text-secondary transition-all duration-200 hover:border-cpm-border-hover hover:text-cpm-text-primary lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      <div
        ref={menuRef}
        className="overflow-hidden border-t border-cpm-border/60 bg-cpm-bg-primary/95 backdrop-blur-xl transition-all duration-300 ease-in-out lg:hidden"
        style={{
          maxHeight: mobileOpen
            ? `${NAV_LINKS.length * 48 + 56}px`
            : "0px",
          opacity: mobileOpen ? 1 : 0,
        }}
      >
        <div className="px-4 py-2">
          {NAV_LINKS.map((link) => (
            <button
              key={link.slug}
              onClick={() => handleNav(link.slug)}
              className={`relative flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                currentPage === link.slug
                  ? "text-cpm-accent"
                  : "text-cpm-text-secondary hover:bg-cpm-bg-secondary hover:text-cpm-text-primary"
              }`}
            >
              {link.label}
              {currentPage === link.slug && (
                <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-cpm-accent" />
              )}
            </button>
          ))}
          <div className="mt-2 border-t border-cpm-border/60 pt-2">
            <button
              onClick={() => {
                setMobileOpen(false);
                onNavigate("admin");
              }}
              className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-cpm-text-tertiary transition-all hover:bg-cpm-bg-secondary hover:text-cpm-text-secondary"
            >
              <Shield className="mr-2 h-3 w-3" />
              Admin
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// WEBSITE VIEW -- renders blocks from PageRenderer with scroll-reveal
// ============================================================
function WebsiteView({ pageData }: { pageData: BlockData }) {
  const content = pageData?.content;

  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cpm-bg-secondary ring-1 ring-cpm-border">
          <FileText className="h-8 w-8 text-cpm-text-tertiary" />
        </div>
        <p className="mb-1 text-lg font-medium text-cpm-text-secondary">
          No content yet
        </p>
        <p className="text-sm text-cpm-text-tertiary">
          This page has no content blocks.
        </p>
      </div>
    );
  }

  return (
    <div>
      {content.map((item, index) => {
        const key = (item.props?.id as string) || `block-${item.type}-${index}`;
        return (
          <ScrollReveal key={key} delay={Math.min(index * 50, 300)}>
            <BlockRendererWrapper block={item} index={index} />
          </ScrollReveal>
        );
      })}
    </div>
  );
}

/** Thin wrapper that renders a single block via PageRenderer's block rendering */
function BlockRendererWrapper({
  block,
  index,
}: {
  block: BlockItem;
  index: number;
}) {
  return (
    <PageRenderer
      data={{ content: [block], root: { props: {} } }}
    />
  );
}

// ============================================================
// CMS ADMIN DASHBOARD
// ============================================================
function AdminDashboard({ navigate }: { navigate: (path: string) => void }) {
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PageListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newTemplate, setNewTemplate] = useState("blank");
  const [creating, setCreating] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error("Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleTitleChange = useCallback((title: string) => {
    setNewTitle(title);
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setNewSlug(slug);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim() || !newSlug.trim()) return;
    setCreating(true);
    try {
      const templateData = getTemplateData(newTemplate);
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newSlug,
          title: newTitle,
          data: templateData,
          status: "draft",
        }),
      });
      if (res.ok) {
        toast.success(`Page "${newTitle}" created`);
        setCreateOpen(false);
        setNewTitle("");
        setNewSlug("");
        setNewTemplate("blank");
        navigate(`#/admin/edit/${newSlug}`);
      } else {
        toast.error("Failed to create page. Slug may already exist.");
      }
    } catch {
      toast.error("Failed to create page");
    } finally {
      setCreating(false);
    }
  }, [newTitle, newSlug, newTemplate, navigate]);

  const handleDuplicate = useCallback(
    async (page: PageListItem) => {
      try {
        const res = await fetch(`/api/pages/${page.slug}`);
        if (!res.ok) {
          toast.error("Failed to fetch page data");
          return;
        }
        const pageData = await res.json();
        const nSlug = `${page.slug}-copy`;
        const nTitle = `${page.title} (Copy)`;
        const createRes = await fetch("/api/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: nSlug,
            title: nTitle,
            data: pageData.data || { content: [] },
            status: "draft",
          }),
        });
        if (createRes.ok) {
          toast.success(`Duplicated "${page.title}"`);
          fetchPages();
          navigate(`#/admin/edit/${nSlug}`);
        } else {
          toast.error("Failed to duplicate page");
        }
      } catch {
        toast.error("Failed to duplicate page");
      }
    },
    [fetchPages, navigate]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pages/${deleteTarget.slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Deleted "${deleteTarget.title}"`);
        setDeleteTarget(null);
        fetchPages();
      } else {
        toast.error("Failed to delete page");
      }
    } catch {
      toast.error("Failed to delete page");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchPages]);

  const handleToggleStatus = useCallback(
    async (page: PageListItem) => {
      const newStatus =
        page.status === "published" ? "draft" : "published";
      try {
        const res = await fetch(`/api/pages/${page.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          toast.success(`"${page.title}" is now ${newStatus}`);
          fetchPages();
        } else {
          toast.error("Failed to update status");
        }
      } catch {
        toast.error("Failed to update status");
      }
    },
    [fetchPages]
  );

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Date().toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;
    const q = searchQuery.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [pages, searchQuery]);

  return (
    <div className="min-h-screen bg-cpm-bg-primary">
      <div className="sticky top-0 z-50 border-b border-cpm-border bg-cpm-bg-primary/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="CPM" className="h-7 w-auto" />
            <div className="hidden h-5 w-px bg-cpm-border sm:block" />
            <h1 className="hidden text-sm font-medium text-cpm-text-primary sm:block">
              CMS Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <CalendarCheck className="hidden h-4 w-4 text-cpm-accent md:block" />
            <span className="hidden text-xs text-cpm-text-tertiary lg:block">
              {currentTime}
            </span>
            <div className="hidden h-5 w-px bg-cpm-border sm:block" />
            <button
              onClick={() => navigate("#/home")}
              className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-3 py-1.5 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View Site</span>
            </button>
            <button
              onClick={() => setMediaOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-3 py-1.5 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-accent"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Media</span>
            </button>
            <button
              onClick={() => {
                logoutAdmin();
                toast.success("Signed out");
                navigate("#/home");
              }}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400/80 transition-all hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-light text-cpm-text-primary">All Pages</h2>
            <p className="mt-1 text-sm text-cpm-text-tertiary">
              {pages.length} page{pages.length !== 1 ? "s" : ""} in your CMS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPages()}
              className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-3 py-2 text-xs text-cpm-text-secondary transition-all hover:border-cpm-border-hover hover:text-cpm-text-primary"
              title="Refresh pages"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setMediaOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-3 py-2 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-accent"
              title="Media Library"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Media</span>
            </button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-cpm-accent px-4 text-xs font-semibold text-cpm-bg-primary transition-all hover:bg-cpm-accent-hover active:scale-[0.98]"
            >
              <FilePlus className="h-3.5 w-3.5" />
              Create New Page
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cpm-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pages..."
              className="h-9 w-full rounded-lg border border-cpm-border bg-cpm-bg-secondary pl-10 pr-4 text-sm text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:border-cpm-accent/50 focus:outline-none focus:ring-1 focus:ring-cpm-accent/20"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-cpm-border bg-cpm-bg-secondary">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cpm-accent/30 border-t-cpm-accent" />
                <span className="text-xs text-cpm-text-tertiary">
                  Loading pages...
                </span>
              </div>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cpm-border bg-cpm-bg-primary">
                <LayoutGrid className="h-7 w-7 text-cpm-text-tertiary" />
              </div>
              <p className="text-sm font-medium text-cpm-text-secondary">
                {searchQuery ? "No matching pages" : "No pages found"}
              </p>
              <p className="mt-1 text-xs text-cpm-text-tertiary">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first page to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cpm-border bg-cpm-bg-primary/50">
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-cpm-text-tertiary">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-cpm-text-tertiary">
                        Slug
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-cpm-text-tertiary">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-cpm-text-tertiary">
                        Last Updated
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-cpm-text-tertiary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cpm-border">
                    {filteredPages.map((page) => (
                      <tr
                        key={page.id}
                        className="transition-colors hover:bg-cpm-border/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cpm-border bg-cpm-bg-primary">
                              <FileText className="h-3.5 w-3.5 text-cpm-text-tertiary" />
                            </div>
                            <span className="text-sm font-medium text-cpm-text-primary">
                              {page.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="rounded bg-cpm-bg-primary px-2 py-0.5 text-xs text-cpm-text-secondary">
                            {page.slug}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatus(page)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                              page.status === "published"
                                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                page.status === "published"
                                  ? "bg-emerald-400"
                                  : "bg-amber-400"
                              }`}
                            />
                            {page.status || "draft"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-xs text-cpm-text-tertiary">
                            <Clock className="h-3 w-3" />
                            {formatDate(page.updatedAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                navigate(`#/admin/edit/${page.slug}`)
                              }
                              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-cpm-text-secondary transition-all hover:bg-cpm-accent/10 hover:text-cpm-accent"
                              title="Edit page"
                            >
                              <Pencil className="h-3 w-3" />
                              <span className="hidden xl:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDuplicate(page)}
                              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-cpm-text-secondary transition-all hover:bg-blue-500/10 hover:text-blue-400"
                              title="Duplicate page"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => navigate(`#/${page.slug}`)}
                              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-cpm-text-secondary transition-all hover:bg-emerald-500/10 hover:text-emerald-400"
                              title="View page"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(page)}
                              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-cpm-text-secondary transition-all hover:bg-red-500/10 hover:text-red-400"
                              title="Delete page"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 p-3 lg:hidden">
                {filteredPages.map((page) => (
                  <div
                    key={page.id}
                    className="rounded-xl border border-cpm-border bg-cpm-bg-primary/50 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cpm-border bg-cpm-bg-secondary">
                          <FileText className="h-3.5 w-3.5 text-cpm-text-tertiary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-cpm-text-primary">
                            {page.title}
                          </p>
                          <code className="text-[10px] text-cpm-text-tertiary">
                            {page.slug}
                          </code>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleStatus(page)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          page.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            page.status === "published"
                              ? "bg-emerald-400"
                              : "bg-amber-400"
                          }`}
                        />
                        {page.status || "draft"}
                      </button>
                    </div>
                    <div className="mb-3 flex items-center gap-1 text-xs text-cpm-text-tertiary">
                      <Clock className="h-3 w-3" />
                      {formatDate(page.updatedAt)}
                    </div>
                    <div className="flex items-center gap-1 border-t border-cpm-border pt-3">
                      <button
                        onClick={() =>
                          navigate(`#/admin/edit/${page.slug}`)
                        }
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-cpm-accent transition-all hover:bg-cpm-accent/10"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicate(page)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-cpm-text-secondary transition-all hover:bg-blue-500/10 hover:text-blue-400"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </button>
                      <button
                        onClick={() => navigate(`#/${page.slug}`)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-cpm-text-secondary transition-all hover:bg-emerald-500/10 hover:text-emerald-400"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                      <button
                        onClick={() => setDeleteTarget(page)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-cpm-text-secondary transition-all hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-cpm-text-tertiary">
            Signed in as Admin &middot; Christiano Property Management CMS
          </p>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-cpm-border bg-cpm-bg-secondary sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cpm-text-primary">
              Create New Page
            </DialogTitle>
            <DialogDescription className="text-cpm-text-secondary">
              Add a new page to your CMS. Choose a template to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-cpm-text-secondary">
                Page Title
              </Label>
              <Input
                value={newTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. My New Page"
                className="h-10 border-cpm-border bg-cpm-bg-primary text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:border-cpm-accent/50 focus:ring-cpm-accent/20"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-cpm-text-secondary">
                URL Slug
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cpm-text-tertiary">#/</span>
                <Input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="my-new-page"
                  className="h-10 border-cpm-border bg-cpm-bg-primary text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:border-cpm-accent/50 focus:ring-cpm-accent/20"
                />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-cpm-text-secondary">
                Template
              </Label>
              <Select value={newTemplate} onValueChange={setNewTemplate}>
                <SelectTrigger className="h-10 border-cpm-border bg-cpm-bg-primary text-cpm-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-cpm-border bg-cpm-bg-secondary">
                  <SelectItem value="blank">
                    <span className="text-cpm-text-primary">Blank Page</span>
                  </SelectItem>
                  <SelectItem value="home">
                    <span className="text-cpm-text-primary">Home Layout</span>
                  </SelectItem>
                  <SelectItem value="about">
                    <span className="text-cpm-text-primary">About Layout</span>
                  </SelectItem>
                  <SelectItem value="properties">
                    <span className="text-cpm-text-primary">Properties Layout</span>
                  </SelectItem>
                  <SelectItem value="contact">
                    <span className="text-cpm-text-primary">Contact Layout</span>
                  </SelectItem>
                  <SelectItem value="faq">
                    <span className="text-cpm-text-primary">FAQ Layout</span>
                  </SelectItem>
                  <SelectItem value="pricing">
                    <span className="text-cpm-text-primary">Pricing Layout</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setCreateOpen(false)}
              className="flex h-9 items-center rounded-lg border border-cpm-border px-4 text-xs text-cpm-text-secondary transition-all hover:bg-cpm-border"
            >
              Cancel
            </button>
            <Button
              onClick={handleCreate}
              disabled={creating || !newTitle.trim() || !newSlug.trim()}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-cpm-accent px-4 text-xs font-semibold text-cpm-bg-primary transition-all hover:bg-cpm-accent-hover disabled:opacity-50"
            >
              {creating ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-cpm-bg-primary/30 border-t-cpm-bg-primary" />
                  Creating...
                </>
              ) : (
                <>
                  <FilePlus className="h-3 w-3" />
                  Create Page
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="border-cpm-border bg-cpm-bg-secondary sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-cpm-text-primary">Delete Page</DialogTitle>
            <DialogDescription className="text-cpm-text-secondary">
              Are you sure you want to delete{" "}
              <span className="font-medium text-cpm-text-primary">
                &quot;{deleteTarget?.title}&quot;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex h-9 items-center rounded-lg border border-cpm-border px-4 text-xs text-cpm-text-secondary transition-all hover:bg-cpm-border"
            >
              Cancel
            </button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3" />
                  Delete Page
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaLibrary open={mediaOpen} onClose={() => setMediaOpen(false)} />
    </div>
  );
}

// ============================================================
// BLOCK PROPERTY EDITOR FIELD
// ============================================================
function PropertyField({
  propName,
  propValue,
  onChange,
}: {
  propName: string;
  propValue: unknown;
  onChange: (val: unknown) => void;
}) {
  const label = propName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());

  if (typeof propValue === "string") {
    // Detect if it's a long string (likely description/body)
    if (propValue.length > 120 || propValue.includes("\n")) {
      return (
        <div className="mb-3">
          <Label className="mb-1 block text-[11px] font-medium text-cpm-text-secondary">
            {label}
          </Label>
          <Textarea
            value={propValue}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="border-cpm-border bg-cpm-bg-primary text-cpm-text-primary text-xs placeholder:text-cpm-text-tertiary focus:border-cpm-accent/50 focus:ring-cpm-accent/20 resize-y min-h-[60px]"
          />
        </div>
      );
    }
    return (
      <div className="mb-3">
        <Label className="mb-1 block text-[11px] font-medium text-cpm-text-secondary">
          {label}
        </Label>
        <Input
          value={propValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 border-cpm-border bg-cpm-bg-primary text-xs text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:border-cpm-accent/50 focus:ring-cpm-accent/20"
        />
      </div>
    );
  }

  if (typeof propValue === "number") {
    return (
      <div className="mb-3">
        <Label className="mb-1 block text-[11px] font-medium text-cpm-text-secondary">
          {label}
        </Label>
        <Input
          type="number"
          value={propValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-8 border-cpm-border bg-cpm-bg-primary text-xs text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:border-cpm-accent/50 focus:ring-cpm-accent/20"
        />
      </div>
    );
  }

  if (typeof propValue === "boolean") {
    return (
      <div className="mb-3 flex items-center justify-between">
        <Label className="text-[11px] font-medium text-cpm-text-secondary">
          {label}
        </Label>
        <button
          onClick={() => onChange(!propValue)}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            propValue ? "bg-cpm-accent" : "bg-cpm-border-hover"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
              propValue ? "translate-x-4" : ""
            }`}
          />
        </button>
      </div>
    );
  }

  if (Array.isArray(propValue)) {
    // Array of objects (items list, features, etc.)
    if (
      propValue.length > 0 &&
      typeof propValue[0] === "object" &&
      propValue[0] !== null
    ) {
      const objArr = propValue as Record<string, unknown>[];
      // Get the block schema if available to know field types
      const itemKeys = Object.keys(objArr[0] || {});
      return (
        <div className="mb-3">
          <Label className="mb-1 block text-[11px] font-medium text-cpm-text-secondary">
            {label} <span className="text-cpm-text-tertiary">({objArr.length} items)</span>
          </Label>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-cpm-border bg-cpm-bg-primary p-2">
            {objArr.map((item, idx) => {
              const summary = item.name || item.title || item.question || item.heading || `Item ${idx + 1}`;
              return (
                <div
                  key={idx}
                  className="group rounded-lg border border-cpm-border bg-cpm-bg-secondary transition-colors hover:border-cpm-accent/20"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5">
                    <span className="truncate text-[11px] font-medium text-cpm-text-primary">
                      {String(summary)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const next = [...objArr];
                          if (idx > 0) { [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; }
                          onChange(next);
                        }}
                        disabled={idx === 0}
                        className="p-0.5 text-cpm-text-tertiary transition-colors hover:text-cpm-accent disabled:opacity-30"
                        title="Move up"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          const next = [...objArr];
                          if (idx < next.length - 1) { [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]; }
                          onChange(next);
                        }}
                        disabled={idx === objArr.length - 1}
                        className="p-0.5 text-cpm-text-tertiary transition-colors hover:text-cpm-accent disabled:opacity-30"
                        title="Move down"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          const next = [...objArr];
                          next.splice(idx, 1);
                          onChange(next);
                        }}
                        className="p-0.5 text-cpm-text-tertiary transition-colors hover:text-red-400"
                        title="Delete item"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-cpm-border px-2.5 py-2 space-y-2">
                    {itemKeys.map((key) => {
                      const val = item[key];
                      const fieldLabel = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                      if (typeof val === "string") {
                        if (val.length > 80 || val.includes("\n")) {
                          return (
                            <div key={key}>
                              <span className="block text-[9px] uppercase tracking-wider text-cpm-text-tertiary mb-0.5">{fieldLabel}</span>
                              <textarea
                                value={val}
                                onChange={(e) => {
                                  const next = [...objArr];
                                  next[idx] = { ...next[idx], [key]: e.target.value };
                                  onChange(next);
                                }}
                                rows={2}
                                className="w-full rounded border border-cpm-border bg-cpm-bg-primary px-2 py-1 text-[10px] text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:border-cpm-accent/50 focus:outline-none resize-y min-h-[32px]"
                              />
                            </div>
                          );
                        }
                        return (
                          <div key={key}>
                            <span className="block text-[9px] uppercase tracking-wider text-cpm-text-tertiary mb-0.5">{fieldLabel}</span>
                            <Input
                              value={val}
                              onChange={(e) => {
                                const next = [...objArr];
                                next[idx] = { ...next[idx], [key]: e.target.value };
                                onChange(next);
                              }}
                              className="h-6 border-cpm-border bg-cpm-bg-primary text-[10px] text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:border-cpm-accent/50 focus:ring-0"
                            />
                          </div>
                        );
                      }
                      if (typeof val === "number") {
                        return (
                          <div key={key}>
                            <span className="block text-[9px] uppercase tracking-wider text-cpm-text-tertiary mb-0.5">{fieldLabel}</span>
                            <Input
                              type="number"
                              value={val}
                              onChange={(e) => {
                                const next = [...objArr];
                                next[idx] = { ...next[idx], [key]: Number(e.target.value) };
                                onChange(next);
                              }}
                              className="h-6 border-cpm-border bg-cpm-bg-primary text-[10px] text-cpm-text-primary focus:border-cpm-accent/50 focus:ring-0"
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => {
              const template = objArr.length > 0
                ? Object.fromEntries(Object.keys(objArr[0]).map(k => [k, ""]))
                : {};
              onChange([...objArr, template]);
            }}
            className="mt-1 flex items-center gap-1 text-[11px] text-cpm-accent transition-colors hover:text-cpm-accent-hover"
          >
            <FilePlus className="h-3 w-3" /> Add item
          </button>
        </div>
      );
    }
    // Array of strings
    return (
      <div className="mb-3">
        <Label className="mb-1 block text-[11px] font-medium text-cpm-text-secondary">
          {label} ({propValue.length})
        </Label>
        <div className="space-y-1">
          {propValue.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <Input
                value={item as string}
                onChange={(e) => {
                  const next = [...propValue];
                  next[idx] = e.target.value;
                  onChange(next);
                }}
                className="h-7 border-cpm-border bg-cpm-bg-primary text-xs text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:border-cpm-accent/50"
              />
              <button
                onClick={() => {
                  const next = [...propValue];
                  next.splice(idx, 1);
                  onChange(next);
                }}
                className="text-cpm-text-tertiary transition-colors hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([...propValue, ""])}
            className="text-[11px] text-cpm-accent transition-colors hover:text-cpm-accent-hover"
          >
            + Add
          </button>
        </div>
      </div>
    );
  }

  // Fallback: JSON display
  if (typeof propValue === "object" && propValue !== null) {
    return (
      <div className="mb-3">
        <Label className="mb-1 block text-[11px] font-medium text-cpm-text-secondary">
          {label}
        </Label>
        <div className="rounded-lg border border-cpm-border bg-cpm-bg-primary p-2">
          <code className="block max-h-32 overflow-y-auto text-[10px] text-cpm-text-tertiary">
            {JSON.stringify(propValue, null, 2)}
          </code>
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================
// PAGE EDITOR
// ============================================================
function PageEditor({
  slug,
  navigate,
}: {
  slug: string;
  navigate: (path: string) => void;
}) {
  const [pageData, setPageData] = useState<BlockData | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showJsonView, setShowJsonView] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [blockSearch, setBlockSearch] = useState("");
  const [mediaOpen, setMediaOpen] = useState(false);

  // Undo history
  const undoStack = useRef<BlockData[]>([]);
  const lastSavedRef = useRef<string>("");

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${slug}`);
      if (res.ok) {
        const data = await res.json();
        const blockData: BlockData = data.data || createEmptyBlockData(slug);
        setPageData(blockData);
        setPageTitle(data.title || slug);
        lastSavedRef.current = JSON.stringify(blockData);
        setIsDirty(false);
      } else {
        toast.error("Failed to load page");
        navigate("#/admin");
      }
    } catch {
      toast.error("Failed to load page");
      navigate("#/admin");
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  // Push to undo stack before making changes
  const pushUndo = useCallback((currentData: BlockData) => {
    undoStack.current.push(JSON.parse(JSON.stringify(currentData)));
    if (undoStack.current.length > 50) undoStack.current.shift();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (mod && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty && pageData) {
        handleSave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = useCallback(async () => {
    if (!pageData || !isDirty) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: pageData }),
      });
      if (res.ok) {
        lastSavedRef.current = JSON.stringify(pageData);
        setIsDirty(false);
        toast.success("Page saved");
      } else {
        toast.error("Failed to save page");
      }
    } catch {
      toast.error("Failed to save page");
    } finally {
      setSaving(false);
    }
  }, [pageData, slug, isDirty]);

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) {
      toast.info("Nothing to undo");
      return;
    }
    const prev = undoStack.current.pop();
    if (prev) {
      setPageData(prev);
      setIsDirty(true);
      toast.success("Undone");
    }
  }, []);

  const updateBlock = useCallback(
    (index: number, newProps: Record<string, unknown>) => {
      if (!pageData) return;
      pushUndo(pageData);
      const newContent = [...pageData.content];
      newContent[index] = {
        ...newContent[index],
        props: { ...newContent[index].props, ...newProps },
      };
      setPageData({ ...pageData, content: newContent });
      setIsDirty(true);
    },
    [pageData, pushUndo]
  );

  const moveBlock = useCallback(
    (index: number, direction: "up" | "down") => {
      if (!pageData) return;
      const content = pageData.content;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= content.length) return;
      pushUndo(pageData);
      const newContent = [...content];
      [newContent[index], newContent[newIndex]] = [
        newContent[newIndex],
        newContent[index],
      ];
      setPageData({ ...pageData, content: newContent });
      setIsDirty(true);
      toast.success("Block moved");
    },
    [pageData, pushUndo]
  );

  const deleteBlock = useCallback(
    (index: number) => {
      if (!pageData) return;
      pushUndo(pageData);
      const newContent = [...pageData.content];
      newContent.splice(index, 1);
      setPageData({ ...pageData, content: newContent });
      setIsDirty(true);
      setSelectedBlockIndex(null);
      toast.success("Block deleted");
    },
    [pageData, pushUndo]
  );

  const addBlock = useCallback(
    (type: string) => {
      if (!pageData) return;
      pushUndo(pageData);
      const defaults = getBlockDefaults(type);
      const newBlock: BlockItem = {
        type,
        props: {
          ...defaults,
          id: `${type}-${Date.now()}`,
        },
      };
      const newContent = [...pageData.content, newBlock];
      setPageData({ ...pageData, content: newContent });
      setIsDirty(true);
      setShowAddBlock(false);
      setBlockSearch("");
      setSelectedBlockIndex(newContent.length - 1);
      toast.success(`Added ${type} block`);
    },
    [pageData, pushUndo]
  );

  const handleExportJson = useCallback(() => {
    if (!pageData) return;
    const blob = new Blob([JSON.stringify(pageData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported");
  }, [pageData, slug]);

  const handleImportJson = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string);
          if (Array.isArray(imported?.content)) {
            pushUndo(pageData!);
            setPageData(imported);
            setIsDirty(true);
            toast.success("JSON imported");
          } else {
            toast.error("Invalid JSON format");
          }
        } catch {
          toast.error("Failed to parse JSON");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [pageData, pushUndo]);

  const blockTypes = useMemo(() => getBlockTypeList(), []);
  const filteredBlockTypes = useMemo(() => {
    if (!blockSearch.trim()) return blockTypes;
    const q = blockSearch.toLowerCase();
    return blockTypes.filter(
      (bt) =>
        bt.type.toLowerCase().includes(q) ||
        bt.label.toLowerCase().includes(q)
    );
  }, [blockTypes, blockSearch]);

  const selectedBlock = useMemo(() => {
    if (selectedBlockIndex === null || !pageData) return null;
    return pageData.content[selectedBlockIndex] || null;
  }, [selectedBlockIndex, pageData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-cpm-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cpm-accent/30 border-t-cpm-accent" />
          <p className="text-xs text-cpm-text-tertiary">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!pageData) return null;

  // JSON View
  if (showJsonView) {
    return (
      <div className="flex h-screen flex-col bg-cpm-bg-primary">
        <div className="flex items-center gap-2 border-b border-cpm-border bg-cpm-bg-primary px-4 py-2">
          <button
            onClick={() => setShowJsonView(false)}
            className="flex items-center gap-1 rounded-lg border border-cpm-border px-2.5 py-1.5 text-xs text-cpm-text-secondary hover:text-cpm-text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <span className="text-xs text-cpm-text-tertiary">JSON View</span>
          <div className="flex-1" />
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 rounded-lg border border-cpm-border px-2.5 py-1.5 text-xs text-cpm-text-secondary hover:text-cpm-accent transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="rounded-lg border border-cpm-border bg-cpm-bg-secondary p-4 text-xs text-cpm-text-secondary">
            {JSON.stringify(pageData, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Preview Mode
  if (previewMode) {
    return (
      <div className="min-h-screen bg-cpm-bg-primary">
        <div className="sticky top-0 z-50 flex items-center gap-2 border-b border-cpm-border bg-cpm-bg-primary/95 px-4 py-2 backdrop-blur-xl">
          <button
            onClick={() => setPreviewMode(false)}
            className="flex items-center gap-1 rounded-lg border border-cpm-border px-2.5 py-1.5 text-xs text-cpm-text-secondary hover:text-cpm-text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Editor
          </button>
          <span className="text-xs text-cpm-accent">Preview Mode</span>
          <div className="flex-1" />
          <button
            onClick={() => navigate(`#/${slug}`)}
            className="flex items-center gap-1 rounded-lg border border-cpm-border px-2.5 py-1.5 text-xs text-cpm-text-secondary hover:text-cpm-text-primary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Live
          </button>
        </div>
        <div className="mx-auto max-w-7xl pt-4">
          <PageRenderer data={pageData} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-cpm-bg-primary">
      <div className="flex items-center gap-2 border-b border-cpm-border bg-cpm-bg-primary px-3 py-2">
        <button
          onClick={() => navigate("#/admin")}
          className="flex items-center gap-1 rounded-lg border border-cpm-border px-2.5 py-1.5 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-text-primary"
          title="Back to dashboard"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="mx-2 h-5 w-px bg-cpm-border" />

        <div className="flex items-center gap-1.5">
          {isDirty && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          )}
          <span className="max-w-[120px] truncate text-sm font-medium text-cpm-text-primary sm:max-w-none">
            {pageTitle}
          </span>
        </div>

        <div className="flex-1" />

        <button
          onClick={handleUndo}
          disabled={undoStack.current.length === 0}
          className="flex items-center gap-1 rounded-lg border border-cpm-border px-2 py-1.5 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-text-primary disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>

        <Search className="hidden h-3.5 w-3.5 text-cpm-text-tertiary md:block" />

        <button
          onClick={() => setShowAddBlock(true)}
          className="flex items-center gap-1 rounded-lg border border-cpm-accent/30 px-2.5 py-1.5 text-xs text-cpm-accent transition-all hover:bg-cpm-accent/10 hover:border-cpm-accent/60"
          title="Add Block"
        >
          <FilePlus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add Block</span>
        </button>

        <CalendarCheck className="hidden h-3.5 w-3.5 text-cpm-text-tertiary md:block" />

        <div className="mx-1 h-5 w-px bg-cpm-border" />

        <button
          onClick={() => setPreviewMode(true)}
          className="flex items-center gap-1 rounded-lg border border-cpm-border px-2.5 py-1.5 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-text-primary"
          title="Preview"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            isDirty
              ? "bg-cpm-accent text-cpm-bg-primary hover:bg-cpm-accent-hover active:scale-[0.97]"
              : "border border-cpm-border text-cpm-text-tertiary"
          }`}
        >
          {saving ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-cpm-bg-primary/30 border-t-cpm-bg-primary" />
          ) : (
            "Save"
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-center rounded-lg border border-cpm-border px-2 py-1.5 text-cpm-text-secondary transition-all hover:border-cpm-border-hover hover:text-cpm-text-primary">
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-cpm-border bg-cpm-bg-secondary text-cpm-text-secondary"
          >
            <DropdownMenuItem
              onClick={handleImportJson}
              className="text-xs hover:text-cpm-text-primary focus:text-cpm-text-primary"
            >
              <Upload className="mr-2 h-3.5 w-3.5" />
              Import JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportJson}
              className="text-xs hover:text-cpm-text-primary focus:text-cpm-text-primary"
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              Export JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-cpm-border" />
            <DropdownMenuItem
              onClick={() => setShowJsonView(true)}
              className="text-xs hover:text-cpm-text-primary focus:text-cpm-text-primary"
            >
              <FileText className="mr-2 h-3.5 w-3.5" />
              View JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setPreviewMode(true)}
              className="text-xs hover:text-cpm-text-primary focus:text-cpm-text-primary"
            >
              <Eye className="mr-2 h-3.5 w-3.5" />
              Preview Mode
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-cpm-border" />
            <DropdownMenuItem
              onClick={() => setMediaOpen(true)}
              className="text-xs hover:text-cpm-accent focus:text-cpm-accent"
            >
              <ImageIcon className="mr-2 h-3.5 w-3.5" />
              Media Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-cpm-border bg-cpm-bg-primary px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-cpm-text-tertiary">
              Blocks ({pageData.content.length})
            </span>
            <div className="flex-1" />
            <button
              onClick={() => setShowAddBlock(true)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-cpm-accent transition-colors hover:bg-cpm-accent/10"
            >
              <FilePlus className="h-3 w-3" />
              Add
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="hidden w-56 shrink-0 overflow-y-auto border-r border-cpm-border bg-cpm-bg-primary md:block">
              {pageData.content.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <p className="mb-2 text-xs text-cpm-text-tertiary">
                    No blocks yet
                  </p>
                  <button
                    onClick={() => setShowAddBlock(true)}
                    className="flex items-center gap-1 rounded-lg border border-cpm-accent/30 px-3 py-1.5 text-xs text-cpm-accent transition-all hover:bg-cpm-accent/10"
                  >
                    <FilePlus className="h-3 w-3" />
                    Add Block
                  </button>
                </div>
              ) : (
                <div className="p-2">
                  {pageData.content.map((block, idx) => (
                    <div
                      key={(block.props?.id as string) || `bl-${idx}`}
                      onClick={() => setSelectedBlockIndex(idx)}
                      className={`group mb-1 flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 text-xs transition-all ${
                        selectedBlockIndex === idx
                          ? "border-cpm-accent/40 bg-cpm-accent/10 text-cpm-accent"
                          : "border-transparent bg-cpm-bg-secondary text-cpm-text-secondary hover:border-cpm-border hover:text-cpm-text-primary"
                      }`}
                    >
                      <GripVertical className="h-3 w-3 shrink-0 text-cpm-text-tertiary" />
                      <span className="flex-1 truncate">{block.type}</span>
                      <div className="hidden items-center gap-0.5 group-hover:flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(idx, "up");
                          }}
                          disabled={idx === 0}
                          className="rounded p-0.5 text-cpm-text-tertiary transition-colors hover:text-cpm-text-primary disabled:opacity-30"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(idx, "down");
                          }}
                          disabled={idx === pageData.content.length - 1}
                          className="rounded p-0.5 text-cpm-text-tertiary transition-colors hover:text-cpm-text-primary disabled:opacity-30"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBlock(idx);
                          }}
                          className="rounded p-0.5 text-cpm-text-tertiary transition-colors hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-cpm-bg-primary">
              <div className="mx-auto max-w-4xl px-4 py-6">
                {pageData.content.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cpm-border bg-cpm-bg-secondary">
                      <LayoutGrid className="h-8 w-8 text-cpm-text-tertiary" />
                    </div>
                    <p className="mb-1 text-sm font-medium text-cpm-text-secondary">
                      No content blocks
                    </p>
                    <p className="mb-6 text-xs text-cpm-text-tertiary">
                      Add blocks to build your page
                    </p>
                    <button
                      onClick={() => setShowAddBlock(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-cpm-accent px-4 py-2 text-xs font-semibold text-cpm-bg-primary transition-all hover:bg-cpm-accent-hover"
                    >
                      <FilePlus className="h-3.5 w-3.5" />
                      Add Your First Block
                    </button>
                  </div>
                ) : (
                  pageData.content.map((block, idx) => {
                    const key =
                      (block.props?.id as string) ||
                      `block-${block.type}-${idx}`;
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedBlockIndex(idx)}
                        className={`group relative cursor-pointer rounded-lg transition-all ${
                          selectedBlockIndex === idx
                            ? "ring-2 ring-cpm-accent/50 ring-offset-2 ring-offset-cpm-bg-primary"
                            : "hover:ring-1 hover:ring-cpm-accent/20"
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between md:hidden">
                          <span className="rounded bg-cpm-bg-secondary px-2 py-0.5 text-[10px] font-medium text-cpm-text-secondary">
                            {block.type}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(idx, "up");
                              }}
                              disabled={idx === 0}
                              className="rounded p-1 text-cpm-text-tertiary transition-colors hover:text-cpm-text-primary disabled:opacity-30"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(idx, "down");
                              }}
                              disabled={
                                idx === pageData.content.length - 1
                              }
                              className="rounded p-1 text-cpm-text-tertiary transition-colors hover:text-cpm-text-primary disabled:opacity-30"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBlock(idx);
                              }}
                              className="rounded p-1 text-cpm-text-tertiary transition-colors hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <PageRenderer
                          data={{
                            content: [block],
                            root: { props: {} },
                          }}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedBlock !== null && (
          <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-cpm-border bg-cpm-bg-secondary lg:block">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cpm-border bg-cpm-bg-secondary px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-cpm-text-primary">
                  {selectedBlock.type}
                </p>
                <p className="text-[10px] text-cpm-text-tertiary">
                  Block {selectedBlockIndex! + 1} of{" "}
                  {pageData.content.length}
                </p>
              </div>
              <button
                onClick={() => setSelectedBlockIndex(null)}
                className="rounded p-1 text-cpm-text-tertiary transition-colors hover:text-cpm-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              {Object.entries(selectedBlock.props).map(([key, value]) => (
                <PropertyField
                  key={key}
                  propName={key}
                  propValue={value}
                  onChange={(val) =>
                    updateBlock(selectedBlockIndex!, { [key]: val })
                  }
                />
              ))}
            </div>
          </aside>
        )}
      </div>

      {selectedBlock !== null && (
        <Sheet
          open={selectedBlock !== null}
          onOpenChange={(open) => !open && setSelectedBlockIndex(null)}
        >
          <SheetContent
            side="right"
            className="w-[85vw] max-w-sm border-cpm-border bg-cpm-bg-secondary p-0"
          >
            <SheetHeader className="border-b border-cpm-border px-4 py-3">
              <SheetTitle className="text-sm text-cpm-text-primary">
                {selectedBlock.type}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-60px)]">
              <div className="p-4">
                {Object.entries(selectedBlock.props).map(
                  ([key, value]) => (
                    <PropertyField
                      key={key}
                      propName={key}
                      propValue={value}
                      onChange={(val) =>
                        updateBlock(selectedBlockIndex!, {
                          [key]: val,
                        })
                      }
                    />
                  )
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}

      <Dialog open={showAddBlock} onOpenChange={setShowAddBlock}>
        <DialogContent className="border-cpm-border bg-cpm-bg-secondary sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-cpm-text-primary">
              Add Block
            </DialogTitle>
            <DialogDescription className="text-cpm-text-secondary">
              Choose a block type to add to your page.
            </DialogDescription>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cpm-text-tertiary" />
            <input
              type="text"
              value={blockSearch}
              onChange={(e) => setBlockSearch(e.target.value)}
              placeholder="Search block types..."
              className="h-9 w-full rounded-lg border border-cpm-border bg-cpm-bg-primary pl-10 pr-4 text-sm text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:border-cpm-accent/50 focus:outline-none focus:ring-1 focus:ring-cpm-accent/20"
              autoFocus
            />
          </div>
          <ScrollArea className="max-h-80">
            <div className="grid grid-cols-2 gap-2 pr-2">
              {filteredBlockTypes.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type)}
                  className="flex items-center gap-2 rounded-lg border border-cpm-border bg-cpm-bg-primary p-3 text-left transition-all hover:border-cpm-accent/40 hover:bg-cpm-accent/5"
                >
                  <FilePlus className="h-4 w-4 shrink-0 text-cpm-accent" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-cpm-text-primary">
                      {bt.label}
                    </p>
                    <p className="truncate text-[10px] text-cpm-text-tertiary">
                      {bt.type}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {filteredBlockTypes.length === 0 && (
              <p className="py-8 text-center text-xs text-cpm-text-tertiary">
                No block types found
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <MediaLibrary open={mediaOpen} onClose={() => setMediaOpen(false)} />
    </div>
  );
}

// ============================================================
// MAIN PAGE -- SPA Router
// ============================================================
export default function HomePage() {
  const { route, navigate } = useHashRouter();
  const { type, slug } = parseRoute(route);

  const [pageData, setPageData] = useState<BlockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Track scroll percentage for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollPercent(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check admin auth on mount
  useEffect(() => {
    setAdminAuthed(isAdminAuthenticated());
  }, []);

  // Fetch page data for public pages
  useEffect(() => {
    if (type !== "page") {
      setPageData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/pages/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setPageData(data.data);
          } else {
            // Fall back to default pages
            const def = defaultPages[slug];
            setPageData(def?.data ?? null);
          }
        } else {
          // API failed, fall back to default pages
          const def = defaultPages[slug];
          setPageData(def?.data ?? null);
        }
      } catch {
        // Network error, fall back to default pages
        const def = defaultPages[slug];
        setPageData(def?.data ?? null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, slug]);

  // Handle admin routes
  useEffect(() => {
    if ((type === "admin" || type === "editor") && !adminAuthed) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, [type, adminAuthed]);

  // Login handler
  const handleLoginSuccess = useCallback(() => {
    setAdminAuthed(true);
    setShowLogin(false);
  }, []);

  // Public page navigation handler
  const handlePublicNavigate = useCallback(
    (targetSlug: string) => {
      if (targetSlug === "admin") {
        navigate("#/admin");
      } else {
        navigate(`#/${targetSlug}`);
      }
    },
    [navigate]
  );

  // ---- RENDER ----

  // Login screen
  if (showLogin) {
    return <LoginScreen onLogin={handleLoginSuccess} targetRoute={route} />;
  }

  // Admin dashboard
  if (type === "admin") {
    return <AdminDashboard navigate={navigate} />;
  }

  // Page editor
  if (type === "editor") {
    return <PageEditor slug={slug} navigate={navigate} />;
  }

  // Public page view
  const currentPageSlug = slug;
  const pageLabel =
    NAV_LINKS.find((l) => l.slug === currentPageSlug)?.label || currentPageSlug;

  return (
    <div className="min-h-screen bg-cpm-bg-primary">
      <ScrollProgressBar />
      <NavBar currentPage={currentPageSlug} onNavigate={handlePublicNavigate} />

      <div className="h-16" />

      {loading ? (
        <PageSkeleton pageName={pageLabel} />
      ) : pageData ? (
        <WebsiteView pageData={pageData} />
      ) : (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cpm-bg-secondary ring-1 ring-cpm-border">
            <FileText className="h-8 w-8 text-cpm-text-tertiary" />
          </div>
          <p className="mb-1 text-lg font-medium text-cpm-text-secondary">
            Page not found
          </p>
          <p className="mb-6 text-sm text-cpm-text-tertiary">
            The page &quot;{currentPageSlug}&quot; does not exist.
          </p>
          <button
            onClick={() => navigate("#/home")}
            className="rounded-lg bg-cpm-accent px-4 py-2 text-xs font-semibold text-cpm-bg-primary transition-all hover:bg-cpm-accent-hover"
          >
            Go Home
          </button>
        </div>
      )}

      <BackToTopButton scrollPercent={scrollPercent} />
    </div>
  );
}
