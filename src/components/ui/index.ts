// UI Components Index
// Canonical pattern: functional components with data-slot attributes, cn() for classes

// Layout
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent } from "./card"
export { Separator } from "./separator"
export { AspectRatio } from "./aspect-ratio"

// Actions
export { Button, buttonVariants } from "./button"
export { Toggle, toggleVariants } from "./toggle"
export { ToggleGroup, toggleGroupVariants } from "./toggle-group"

// Forms
export { Input } from "./input"
export { Textarea } from "./textarea"
export { Checkbox } from "./checkbox"
export { Switch } from "./switch"
export { Slider } from "./slider"
export { Label } from "./label"
export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./input-otp"

// Feedback
export { Alert, AlertTitle, AlertDescription } from "./alert"
export { Progress } from "./progress"
export { Loader } from "./loader"
export { Skeleton } from "./skeleton"
export {Toaster as Sonner, Toaster as toaster} from "./sonner"
export {toast} from "sonner"

// Navigation
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "./breadcrumb"
export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuViewport } from "./navigation-menu"
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./pagination"

// Overlays
export { Dialog, DialogTrigger, DialogPortal, DialogClose, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./dialog"
export { AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "./alert-dialog"
export { Popover, PopoverTrigger, PopoverContent } from "./popover"
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip"
export {
    Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription
} from "./sheet"
export { Drawer, DrawerTrigger, DrawerClose, DrawerPortal, DrawerOverlay, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from "./drawer"

// Data Display
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion"
export {
    Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator
} from "./select"
export { RadioGroup, RadioGroupItem } from "./radio-group"
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./table"
export { Avatar, AvatarImage, AvatarFallback } from "./avatar"
export { Badge, badgeVariants } from "./badge"
export { Calendar } from "./calendar"
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator } from "./command"

// Menus
export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut
} from "./dropdown-menu"
export {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuGroup,
    ContextMenuPortal,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuCheckboxItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuRadioGroup
} from "./context-menu"
export {
    Menubar,
    MenubarTrigger,
    MenubarContent,
    MenubarItem,
    MenubarCheckboxItem,
    MenubarRadioItem,
    MenubarLabel,
    MenubarSeparator,
    MenubarShortcut,
    MenubarGroup,
    MenubarPortal,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger
} from "./menubar"

// Advanced
export { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card"
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible"
export { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./resizable"
export { ScrollArea, ScrollBar } from "./scroll-area"
export {Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext} from "./carousel"
export {useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField} from "./form"
export { Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarRail } from "./sidebar"
export type {ChartConfig} from "./chart"
export {ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle} from "./chart"
export { CodeBlock } from "./code-block"
export { Markdown } from "./markdown"
export { Reasoning } from "./reasoning"
export { ResponseStream } from "./response-stream"
export { PromptInput } from "./prompt-input"
export { PromptSuggestion } from "./prompt-suggestion"
