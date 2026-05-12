// Professional Amenity Icons using Lucide React
// Comprehensive mapping for all Guesty BEAPI amenities
import {
  Wifi, Car, Snowflake, Utensils, Tv, WashingMachine, Wind, Coffee,
  Bath, Bed, DoorOpen, Flame, Lock, Mountain, Waves, Sun, Shirt,
  ParkingMeter, Dumbbell, Baby, Dog, Cat, Cigarette, CigaretteOff,
  Accessibility, Refrigerator, Microwave, ChefHat, UtensilsCrossed,
  Armchair, Laptop, Briefcase, Printer, BookOpen, Gamepad2, Monitor,
  Home, Building, TreePine, Flower2, Umbrella, Sailboat, Bike,
  Users, Shield, Bell, Key, MapPin, Phone, Mail, Clock, Calendar,
  Thermometer, Fan, Droplets, Sparkles, Zap, Volume2, VolumeX,
  Eye, EyeOff, Heart, Star, Award, CheckCircle, AlertCircle,
  ArrowUp, ArrowDown, Plus, Minus, X, Check, Info, HelpCircle,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Menu, Search,
  Settings, User, LogOut, LogIn, Edit, Trash2, Save, Download, Upload,
  Share2, Link, ExternalLink, Copy, Clipboard, FileText, Image,
  Video, Music, PlayCircle, PauseCircle, SkipForward, SkipBack,
  Maximize, Minimize, RotateCw, RefreshCw, Loader2, MoreHorizontal,
  Grid, List, Filter, SlidersHorizontal, LayoutGrid, Columns,
  Moon, SunMedium, CloudSun, CloudRain, Cloudy, Sunrise, Sunset,
  Plane, Train, Bus, Ship, CarFront, Footprints, Navigation,
  Compass, Globe, Flag, Bookmark, Tag, Hash, AtSign, Send,
  MessageCircle, MessageSquare, MessagesSquare, Inbox, Archive,
  Folder, FolderOpen, File, Files, Package, Box, Gift, ShoppingBag,
  ShoppingCart, CreditCard, Wallet, Receipt, Calculator, Percent,
  DollarSign, Euro, PoundSterling, Banknote, Coins, PiggyBank,
  TrendingUp, TrendingDown, BarChart2, PieChart, Activity, Target,
  Award as AwardIcon, Trophy, Medal, Crown, Gem, Diamond, Sparkle,
  Rocket, Lightbulb, Bolt, Power, Battery, BatteryCharging, Plug,
  Radio, Headphones, Speaker, Mic, MicOff, Camera, CameraOff,
  Smartphone, Tablet, MonitorSmartphone, Watch, Glasses, Fingerprint,
  ScanLine, QrCode, Barcode, Network, Rss, Wifi as WifiIcon, WifiOff,
  Signal, SignalHigh, SignalLow, SignalZero, Bluetooth, Nfc, Airplay,
  Cast, ScreenShare, PictureInPicture, Fullscreen, SplitSquareVertical,
  Layers, LayoutDashboard, PanelLeft, PanelRight, PanelTop, PanelBottom,
  Table, TableProperties, FormInput, ToggleLeft, ToggleRight, SlidersHorizontal as Slider,
  CircleDot, Square, Circle, Triangle, Hexagon, Octagon, Pentagon,
  Heart as HeartIcon, Star as StarIcon, Bookmark as BookmarkIcon,
  Flag as FlagIcon, Pin, MapPinOff, Route, Signpost, Milestone,
  Tent, Caravan, Landmark, Castle, Church, School, Store, Factory,
  Warehouse, Hospital, Library, GraduationCap, Briefcase as BriefcaseIcon,
  Hammer, Wrench, Wrench as ScrewdriverIcon, Paintbrush, Palette, Scissors,
  Ruler, Pencil, Eraser, Highlighter, PenTool, Type, AlignLeft,
  AlignCenter, AlignRight, AlignJustify, List as ListIcon, ListOrdered,
  Quote, Code, Terminal, FileCode, Bug, GitBranch, GitCommit,
  Lock as LockIcon, Unlock, ShieldCheck, ShieldAlert, ShieldOff,
  Eye as EyeIcon, EyeOff as EyeOffIcon, Scan, ScanFace, UserCheck,
  UserX, UserPlus, UserMinus, Users as UsersIcon, UserCircle,
  Smile, Frown, Meh, Angry, Laugh, Heart as HeartEmoji,
  ThumbsUp, ThumbsDown, HandMetal, Hand, Pointer, MousePointer,
  Move, Grab, GripVertical, GripHorizontal, Maximize2, Minimize2,
  PanelLeftClose, PanelRightClose, SidebarClose, SidebarOpen,
  ChevronsLeft, ChevronsRight, ChevronsUp, ChevronsDown,
  ArrowUpRight, ArrowDownRight, ArrowUpLeft, ArrowDownLeft,
  CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight,
  Undo, Redo, RotateCcw, FlipHorizontal, FlipVertical, Move3d,
  Box as BoxIcon, Boxes, Package as PackageIcon, Archive as ArchiveIcon,
  Inbox as InboxIcon, Send as SendIcon, Forward, Reply, ReplyAll,
  MailOpen, MailPlus, MailMinus, MailCheck, MailX, MailWarning,
  Bell as BellIcon, BellOff, BellRing, Megaphone, AlertTriangle,
  AlertOctagon, AlertCircle as AlertCircleIcon, Info as InfoIcon,
  HelpCircle as HelpCircleIcon, CircleHelp, MessageCircle as MessageIcon,
  MessageSquare as MessageSquareIcon, MessagesSquare as MessagesIcon,
  Sofa, BedDouble, BedSingle, Lamp, LampDesk, LampFloor, LampCeiling,
  DoorClosed, Frame, Wallpaper, Blinds,
  FolderHeart, GalleryVertical, PanelsTopLeft, SquareStack,
  CircleParking, CircleParkingOff, ParkingCircle, ParkingSquare,
  Heater
} from "lucide-react";

// Comprehensive amenity to icon mapping
export const AMENITY_ICONS = {
  // WiFi & Internet
  WIRELESS_INTERNET: { icon: Wifi, label: "WiFi", category: "connectivity" },
  WIFI: { icon: Wifi, label: "WiFi", category: "connectivity" },
  INTERNET: { icon: Globe, label: "Internet", category: "connectivity" },
  ETHERNET_CONNECTION: { icon: Network, label: "Ethernet", category: "connectivity" },
  POCKET_WIFI: { icon: Smartphone, label: "Pocket WiFi", category: "connectivity" },
  
  // Climate
  AIR_CONDITIONING: { icon: Snowflake, label: "Air Conditioning", category: "climate" },
  HEATING: { icon: Thermometer, label: "Heating", category: "climate" },
  FAN: { icon: Fan, label: "Fan", category: "climate" },
  INDOOR_FIREPLACE: { icon: Flame, label: "Fireplace", category: "climate" },
  HEATER: { icon: Heater, label: "Heater", category: "climate" },
  
  // Parking
  FREE_PARKING_ON_PREMISES: { icon: Car, label: "Free Parking", category: "parking" },
  PARKING: { icon: Car, label: "Parking", category: "parking" },
  DISABLED_PARKING_SPOT: { icon: Accessibility, label: "Accessible Parking", category: "parking" },
  EV_CHARGER: { icon: Zap, label: "EV Charger", category: "parking" },
  
  // Kitchen
  KITCHEN: { icon: Utensils, label: "Kitchen", category: "kitchen" },
  COOKING_BASICS: { icon: ChefHat, label: "Cooking Basics", category: "kitchen" },
  DISHES_AND_SILVERWARE: { icon: UtensilsCrossed, label: "Dishes & Silverware", category: "kitchen" },
  REFRIGERATOR: { icon: Refrigerator, label: "Refrigerator", category: "kitchen" },
  MICROWAVE: { icon: Microwave, label: "Microwave", category: "kitchen" },
  OVEN: { icon: ChefHat, label: "Oven", category: "kitchen" },
  STOVE: { icon: Flame, label: "Stove", category: "kitchen" },
  DISHWASHER: { icon: Sparkles, label: "Dishwasher", category: "kitchen" },
  COFFEE_MAKER: { icon: Coffee, label: "Coffee Maker", category: "kitchen" },
  
  // Entertainment
  TV: { icon: Tv, label: "TV", category: "entertainment" },
  CABLE_TV: { icon: Monitor, label: "Cable TV", category: "entertainment" },
  GAME_CONSOLE: { icon: Gamepad2, label: "Game Console", category: "entertainment" },
  
  // Laundry
  WASHER: { icon: WashingMachine, label: "Washer", category: "laundry" },
  DRYER: { icon: Wind, label: "Dryer", category: "laundry" },
  IRON: { icon: Shirt, label: "Iron", category: "laundry" },
  
  // Bathroom
  BATHTUB: { icon: Bath, label: "Bathtub", category: "bathroom" },
  SHAMPOO: { icon: Droplets, label: "Shampoo", category: "bathroom" },
  HAIR_DRYER: { icon: Wind, label: "Hair Dryer", category: "bathroom" },
  HOT_WATER: { icon: Droplets, label: "Hot Water", category: "bathroom" },
  HOT_TUB: { icon: Bath, label: "Hot Tub", category: "bathroom" },
  
  // Bedroom
  BED_LINENS: { icon: Bed, label: "Bed Linens", category: "bedroom" },
  EXTRA_PILLOWS_AND_BLANKETS: { icon: Bed, label: "Extra Pillows", category: "bedroom" },
  ROOM_DARKENING_SHADES: { icon: Moon, label: "Blackout Shades", category: "bedroom" },
  HANGERS: { icon: Shirt, label: "Hangers", category: "bedroom" },
  
  // Safety
  SMOKE_DETECTOR: { icon: Bell, label: "Smoke Detector", category: "safety" },
  CARBON_MONOXIDE_DETECTOR: { icon: Shield, label: "CO Detector", category: "safety" },
  FIRE_EXTINGUISHER: { icon: Flame, label: "Fire Extinguisher", category: "safety" },
  FIRST_AID_KIT: { icon: Heart, label: "First Aid Kit", category: "safety" },
  LOCK_ON_BEDROOM_DOOR: { icon: Lock, label: "Bedroom Lock", category: "safety" },
  
  // Outdoor
  PATIO_OR_BALCONY: { icon: Sun, label: "Balcony", category: "outdoor" },
  GARDEN_OR_BACKYARD: { icon: TreePine, label: "Garden", category: "outdoor" },
  BBQ_GRILL: { icon: Flame, label: "BBQ Grill", category: "outdoor" },
  BEACH_ESSENTIALS: { icon: Umbrella, label: "Beach Essentials", category: "outdoor" },
  
  // Pool
  SWIMMING_POOL: { icon: Waves, label: "Pool", category: "pool" },
  PRIVATE_POOL: { icon: Waves, label: "Private Pool", category: "pool" },
  OUTDOOR_POOL: { icon: Waves, label: "Outdoor Pool", category: "pool" },
  INDOOR_POOL: { icon: Waves, label: "Indoor Pool", category: "pool" },
  COMMUNAL_POOL: { icon: Waves, label: "Shared Pool", category: "pool" },
  
  // Work
  LAPTOP_FRIENDLY_WORKSPACE: { icon: Laptop, label: "Workspace", category: "work" },
  DEDICATED_WORKSPACE: { icon: Briefcase, label: "Dedicated Workspace", category: "work" },
  
  // Building
  ELEVATOR_IN_BUILDING: { icon: ArrowUp, label: "Elevator", category: "building" },
  DOORMAN: { icon: User, label: "Doorman", category: "building" },
  GYM: { icon: Dumbbell, label: "Gym", category: "building" },
  
  // Family
  SUITABLE_FOR_CHILDREN: { icon: Users, label: "Child Friendly", category: "family" },
  SUITABLE_FOR_INFANTS: { icon: Baby, label: "Infant Friendly", category: "family" },
  HIGH_CHAIR: { icon: Baby, label: "High Chair", category: "family" },
  CRIB: { icon: Baby, label: "Crib", category: "family" },
  BABY_BATH: { icon: Bath, label: "Baby Bath", category: "family" },
  BABY_MONITOR: { icon: Monitor, label: "Baby Monitor", category: "family" },
  CHANGING_TABLE: { icon: Baby, label: "Changing Table", category: "family" },
  CHILDREN_BOOKS_AND_TOYS: { icon: BookOpen, label: "Kids Toys", category: "family" },
  CHILDREN_DINNERWARE: { icon: Utensils, label: "Kids Dinnerware", category: "family" },
  PACK_N_PLAY_TRAVEL_CRIB: { icon: Baby, label: "Travel Crib", category: "family" },
  OUTLET_COVERS: { icon: Shield, label: "Outlet Covers", category: "family" },
  STAIR_GATES: { icon: Shield, label: "Stair Gates", category: "family" },
  FIREPLACE_GUARDS: { icon: Shield, label: "Fireplace Guards", category: "family" },
  TABLE_CORNER_GUARDS: { icon: Shield, label: "Corner Guards", category: "family" },
  WINDOW_GUARDS: { icon: Shield, label: "Window Guards", category: "family" },
  
  // Pets
  PETS_ALLOWED: { icon: Dog, label: "Pets Allowed", category: "pets" },
  DOGS: { icon: Dog, label: "Dogs Allowed", category: "pets" },
  CATS: { icon: Cat, label: "Cats Allowed", category: "pets" },
  OTHER_PET: { icon: Heart, label: "Other Pets", category: "pets" },
  PETS_LIVE_ON_THIS_PROPERTY: { icon: Dog, label: "Pets on Property", category: "pets" },
  
  // Smoking
  SMOKING_ALLOWED: { icon: Cigarette, label: "Smoking Allowed", category: "smoking" },
  NO_SMOKING: { icon: CigaretteOff, label: "No Smoking", category: "smoking" },
  
  // Accessibility
  ACCESSIBLE_HEIGHT_BED: { icon: Accessibility, label: "Accessible Bed", category: "accessibility" },
  ACCESSIBLE_HEIGHT_TOILET: { icon: Accessibility, label: "Accessible Toilet", category: "accessibility" },
  FLAT_SMOOTH_PATHWAY_TO_FRONT_DOOR: { icon: Accessibility, label: "Flat Path", category: "accessibility" },
  GRAB_RAILS_FOR_SHOWER_AND_TOILET: { icon: Accessibility, label: "Grab Rails", category: "accessibility" },
  PATH_TO_ENTRANCE_LIT_AT_NIGHT: { icon: Lamp, label: "Lit Path", category: "accessibility" },
  ROLL_IN_SHOWER_WITH_SHOWER_BENCH_OR_CHAIR: { icon: Accessibility, label: "Roll-in Shower", category: "accessibility" },
  SINGLE_LEVEL_HOME: { icon: Home, label: "Single Level", category: "accessibility" },
  STEP_FREE_ACCESS: { icon: Accessibility, label: "Step-free Access", category: "accessibility" },
  TUB_WITH_SHOWER_BENCH: { icon: Bath, label: "Shower Bench", category: "accessibility" },
  WIDE_CLEARANCE_TO_BED: { icon: Accessibility, label: "Wide Clearance", category: "accessibility" },
  WIDE_CLEARANCE_TO_SHOWER_AND_TOILET: { icon: Accessibility, label: "Wide Bathroom", category: "accessibility" },
  WIDE_DOORWAY: { icon: DoorOpen, label: "Wide Doorway", category: "accessibility" },
  WIDE_HALLWAY_CLEARANCE: { icon: Accessibility, label: "Wide Hallway", category: "accessibility" },
  
  // Essentials
  ESSENTIALS: { icon: CheckCircle, label: "Essentials", category: "essentials" },
  PRIVATE_ENTRANCE: { icon: DoorOpen, label: "Private Entrance", category: "essentials" },
  LONG_TERM_STAYS_ALLOWED: { icon: Calendar, label: "Long-term Stays", category: "essentials" },
  LUGGAGE_DROPOFF_ALLOWED: { icon: Package, label: "Luggage Drop-off", category: "essentials" },
  BREAKFAST: { icon: Coffee, label: "Breakfast", category: "essentials" },
  CLEANING_BEFORE_CHECKOUT: { icon: Sparkles, label: "Cleaning", category: "essentials" },
  FIRM_MATTRESS: { icon: Bed, label: "Firm Mattress", category: "essentials" },
  BABYSITTER_RECOMMENDATIONS: { icon: Users, label: "Babysitter Info", category: "essentials" },
};

// Get icon component for an amenity
export const getAmenityIcon = (amenityKey) => {
  if (!amenityKey) return { icon: CheckCircle, label: "Amenity", category: "other" };
  
  // First try direct uppercase+underscore match (enum key style)
  const normalizedKey = amenityKey.toUpperCase().replace(/[\s\-/]/g, '_').replace(/[^A-Z0-9_]/g, '');
  if (AMENITY_ICONS[normalizedKey]) return AMENITY_ICONS[normalizedKey];
  
  // Try common plain-text → enum key conversions from Guesty
  const PLAIN_TEXT_MAP = {
    "AIR CONDITIONING": "AIR_CONDITIONING",
    "WIRELESS INTERNET": "WIRELESS_INTERNET",
    "FREE PARKING ON STREET": "FREE_PARKING_ON_PREMISES",
    "FREE PARKING ON PREMISES": "FREE_PARKING_ON_PREMISES",
    "SWIMMING POOL": "SWIMMING_POOL",
    "HOT TUB": "HOT_TUB",
    "SMOKE DETECTOR": "SMOKE_DETECTOR",
    "CARBON MONOXIDE DETECTOR": "CARBON_MONOXIDE_DETECTOR",
    "FIRE EXTINGUISHER": "FIRE_EXTINGUISHER",
    "FIRST AID KIT": "FIRST_AID_KIT",
    "HAIR DRYER": "HAIR_DRYER",
    "WASHER": "WASHER",
    "DRYER": "DRYER",
    "DISHWASHER": "DISHWASHER",
    "IRON": "IRON",
    "LAPTOP FRIENDLY WORKSPACE": "LAPTOP_FRIENDLY_WORKSPACE",
    "SUITABLE FOR CHILDREN (2-12 YEARS)": "SUITABLE_FOR_CHILDREN",
    "SUITABLE FOR INFANTS (UNDER 2 YEARS)": "SUITABLE_FOR_INFANTS",
    "PETS ALLOWED": "PETS_ALLOWED",
    "SMOKING ALLOWED": "SMOKING_ALLOWED",
    "BBQ GRILL": "BBQ_GRILL",
    "PATIO OR BALCONY": "PATIO_OR_BALCONY",
    "INDOOR FIREPLACE": "INDOOR_FIREPLACE",
    "ELEVATOR IN BUILDING": "ELEVATOR_IN_BUILDING",
    "GYM": "GYM",
    "COFFEE MAKER": "COFFEE_MAKER",
    "MICROWAVE": "MICROWAVE",
    "REFRIGERATOR": "REFRIGERATOR",
    "OVEN": "OVEN",
    "STOVE": "STOVE",
    "TV": "TV",
    "CABLE TV": "CABLE_TV",
    "KITCHEN": "KITCHEN",
    "ESSENTIALS": "ESSENTIALS",
    "BED LINENS": "BED_LINENS",
    "HEATING": "HEATING",
    "SHAMPOO": "SHAMPOO",
    "HANGERS": "HANGERS",
    "PRIVATE ENTRANCE": "PRIVATE_ENTRANCE",
    "LONG TERM STAYS ALLOWED": "LONG_TERM_STAYS_ALLOWED",
    "LUGGAGE DROPOFF ALLOWED": "LUGGAGE_DROPOFF_ALLOWED",
    "EXTRA PILLOWS AND BLANKETS": "EXTRA_PILLOWS_AND_BLANKETS",
    "ROOM-DARKENING SHADES": "ROOM_DARKENING_SHADES",
    "SINGLE LEVEL HOME": "SINGLE_LEVEL_HOME",
    "HOT WATER": "HOT_WATER",
    "PACK 'N PLAY/TRAVEL CRIB": "PACK_N_PLAY_TRAVEL_CRIB",
    "HIGH CHAIR": "HIGH_CHAIR",
    "BATHTUB": "BATHTUB",
    "DISHES AND SILVERWARE": "DISHES_AND_SILVERWARE",
    "COOKING BASICS": "COOKING_BASICS",
    "CLEANING BEFORE CHECKOUT": "CLEANING_BEFORE_CHECKOUT",
    "BREAKFAST": "BREAKFAST",
    "DOORMAN": "DOORMAN",
    "BABY MONITOR": "BABY_MONITOR",
    "BABY BATH": "BABY_BATH",
    "BEACH ESSENTIALS": "BEACH_ESSENTIALS",
    "GARDEN OR BACKYARD": "GARDEN_OR_BACKYARD",
    "WASHER IN COMMON SPACE": "WASHER",
    "DRYER IN COMMON SPACE": "DRYER",
  };
  
  const upperKey = amenityKey.toUpperCase();
  const mappedKey = PLAIN_TEXT_MAP[upperKey];
  if (mappedKey && AMENITY_ICONS[mappedKey]) return AMENITY_ICONS[mappedKey];
  
  // Return formatted label with generic icon
  return { icon: CheckCircle, label: formatAmenityLabel(amenityKey), category: "other" };
};

// Format amenity label from key
export const formatAmenityLabel = (key) => {
  if (!key) return '';
  return key
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
};

// Get amenities by category
export const getAmenitiesByCategory = (amenities) => {
  const categorized = {};
  
  amenities?.forEach(amenity => {
    const { category } = getAmenityIcon(amenity);
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(amenity);
  });
  
  return categorized;
};

// Category labels and order
export const AMENITY_CATEGORIES = {
  connectivity: { label: "Internet & Connectivity", order: 1 },
  climate: { label: "Climate Control", order: 2 },
  kitchen: { label: "Kitchen", order: 3 },
  bathroom: { label: "Bathroom", order: 4 },
  bedroom: { label: "Bedroom", order: 5 },
  entertainment: { label: "Entertainment", order: 6 },
  laundry: { label: "Laundry", order: 7 },
  outdoor: { label: "Outdoor", order: 8 },
  pool: { label: "Pool & Spa", order: 9 },
  work: { label: "Work", order: 10 },
  building: { label: "Building", order: 11 },
  safety: { label: "Safety", order: 12 },
  family: { label: "Family", order: 13 },
  accessibility: { label: "Accessibility", order: 14 },
  pets: { label: "Pets", order: 15 },
  smoking: { label: "House Rules", order: 16 },
  essentials: { label: "Essentials", order: 17 },
  other: { label: "Other", order: 99 },
};

// Highlight amenities (most important to show first)
export const HIGHLIGHT_AMENITIES = [
  'WIRELESS_INTERNET',
  'AIR_CONDITIONING', 
  'FREE_PARKING_ON_PREMISES',
  'KITCHEN',
  'WASHER',
  'TV',
  'SWIMMING_POOL',
  'PATIO_OR_BALCONY',
  'ELEVATOR_IN_BUILDING',
  'PETS_ALLOWED',
];

export default AMENITY_ICONS;
