import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faCircleUser,
  faUserGroup,
  faIdBadge,
  faChartPie,
  faFileLines,
  faDollarSign,
  faMagnifyingGlass,
  faInbox,
  faCircleQuestion,
  faGear,
  faPenToSquare,
  faFaceSmile,
  faArrowUpFromBracket,
  faTableCells,
  faFolder,
  faChevronDown,
  faChevronRight,
  faChevronLeft,
  faChevronUp,
  faArrowDown,
  faTrashCan,
  faFile,
  faFileAudio,
  faImage,
  faCircleInfo,
  faBuilding,
  faMobileScreen,
  faEnvelope,
  faClock,
  faWrench,
  faCalendar,
  faEllipsis,
  faPen,
  faLocationDot,
  faAddressCard,
  faCaretDown,
  faLock,
  faThumbsUp,
  faHeart,
  faSliders,
  faBell,
  faSpa,
  faPalette,
  faDoorOpen,
  faRightToBracket,
  faChartLine,
  faPlane,
  faGraduationCap,
  faShield,
  faCheckCircle,
  faLink,
  faArrowsRotate,
  faWandMagicSparkles,
  faPaperclip,
  faMicrophone,
  faExpand,
  faCompress,
  faDownLeftAndUpRightToCenter,
  faXmark,
  faCircleArrowUp,
  faPaperPlane,
  faEyeSlash,
  faUsers,
  faCirclePlus,
  faBullseye,
  faBullhorn,
  faClipboard,
  faCompass,
  faEye,
  faTemperatureHalf,
  faStar,
  faCircleXmark,
  faPiggyBank,
  faComputer,
  faPassport,
  faPhone,
  faCircle,
  faCheck,
  faUserLock,
  faUserCheck,
  faBan,
  faAngleLeft,
  faHouse,
  faLaptop,
  faSpinner,
  faArrowLeft,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import {
  faCircleUser as faCircleUserRegular,
  faFileLines as faFileLinesRegular,
  faFaceSmile as faFaceSmileRegular,
  faFolder as faFolderRegular,
  faIdBadge as faIdBadgeRegular,
  faCalendar as faCalendarRegular,
  faClock as faClockRegular,
  faCircle as faCircleRegular,
  faCircleQuestion as faCircleQuestionRegular,
} from '@fortawesome/free-regular-svg-icons';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  UserCircle,
  Users,
  IdCard,
  PieChart,
  FileText,
  CircleDollarSign,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Grid2x2Plus,
  Inbox,
  Settings,
  CirclePlus,
} from 'lucide-react';

export type IconName =
  | 'home'
  | 'circle-user'
  | 'user-group'
  | 'id-badge'
  | 'chart-pie-simple'
  | 'file-lines'
  | 'circle-dollar'
  | 'arrow-right-from-line'
  | 'arrow-left-from-line'
  | 'magnifying-glass'
  | 'inbox'
  | 'circle-question'
  | 'gear'
  | 'pen-to-square'
  | 'face-smile'
  | 'arrow-up-from-bracket'
  | 'table-cells'
  | 'folder'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-up'
  | 'arrow-down-to-line'
  | 'trash-can'
  | 'file'
  | 'file-audio'
  | 'image'
  | 'circle-info'
  | 'building'
  | 'mobile'
  | 'envelope'
  | 'clock'
  | 'wrench'
  | 'calendar'
  | 'linkedin'
  | 'ellipsis'
  | 'pen'
  | 'location-dot'
  | 'address-card'
  | 'caret-down'
  | 'lock'
  | 'thumbs-up'
  | 'heart'
  | 'sliders'
  | 'bell'
  | 'spa'
  | 'palette'
  | 'door-open'
  | 'door-closed'
  | 'chart-line'
  | 'plane'
  | 'graduation-cap'
  | 'shield'
  | 'check-circle'
  | 'link'
  | 'arrows-rotate'
  | 'home-lucide'
  | 'user-circle-lucide'
  | 'users-lucide'
  | 'id-card-lucide'
  | 'pie-chart-lucide'
  | 'file-text-lucide'
  | 'circle-dollar-lucide'
  | 'sun'
  | 'moon'
  | 'zoom-in'
  | 'zoom-out'
  | 'file-export'
  | 'sparkles'
  | 'paperclip'
  | 'microphone'
  | 'expand'
  | 'compress'
  | 'down-left-and-up-right-to-center'
  | 'xmark'
  | 'circle-arrow-up'
  | 'paper-plane'
  | 'eye-slash'
  | 'users'
  | 'circle-plus'
  | 'circle-plus-lined'
  | 'bullseye'
  | 'bullhorn'
  | 'clipboard'
  | 'compass'
  | 'eye'
  | 'temperature-half'
  | 'star'
  | 'circle-x'
  | 'piggy-bank'
  | 'computer'
  | 'megaphone'
  | 'passport'
  | 'phone'
  | 'circle'
  | 'check'
  | 'grid-2-plus'
  | 'user-lock'
  | 'user-check'
  | 'ban'
  | 'angle-left'
  | 'house'
  | 'laptop'
  | 'house-building'
  | 'house-laptop'
  | 'spinner'
  | 'arrow-left'
  | 'rotate-left'
  | 'benefits';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  variant?: 'solid' | 'regular';
  style?: React.CSSProperties;
}

const faIconMap = {
  'home': faHome,
  'circle-user': faCircleUser,
  'circle-user-regular': faCircleUserRegular,
  'user-group': faUserGroup,
  'id-badge': faIdBadge,
  'id-badge-regular': faIdBadgeRegular,
  'chart-pie-simple': faChartPie,
  'file-lines': faFileLines,
  'file-lines-regular': faFileLinesRegular,
  'circle-dollar': faDollarSign,
  'magnifying-glass': faMagnifyingGlass,
  'inbox': faInbox,
  'circle-question': faCircleQuestion,
  'circle-question-regular': faCircleQuestionRegular,
  'gear': faGear,
  'pen-to-square': faPenToSquare,
  'face-smile': faFaceSmile,
  'face-smile-regular': faFaceSmileRegular,
  'arrow-up-from-bracket': faArrowUpFromBracket,
  'table-cells': faTableCells,
  'folder': faFolder,
  'folder-regular': faFolderRegular,
  'chevron-down': faChevronDown,
  'chevron-right': faChevronRight,
  'chevron-left': faChevronLeft,
  'chevron-up': faChevronUp,
  'arrow-down-to-line': faArrowDown,
  'trash-can': faTrashCan,
  'file': faFile,
  'file-audio': faFileAudio,
  'image': faImage,
  'circle-info': faCircleInfo,
  'building': faBuilding,
  'mobile': faMobileScreen,
  'envelope': faEnvelope,
  'clock': faClock,
  'clock-regular': faClockRegular,
  'wrench': faWrench,
  'calendar': faCalendar,
  'calendar-regular': faCalendarRegular,
  'linkedin': faLinkedin,
  'ellipsis': faEllipsis,
  'pen': faPen,
  'location-dot': faLocationDot,
  'address-card': faAddressCard,
  'caret-down': faCaretDown,
  'lock': faLock,
  'thumbs-up': faThumbsUp,
  'heart': faHeart,
  'sliders': faSliders,
  'bell': faBell,
  'spa': faSpa,
  'palette': faPalette,
  'door-open': faDoorOpen,
  'door-closed': faRightToBracket,
  'chart-line': faChartLine,
  'plane': faPlane,
  'graduation-cap': faGraduationCap,
  'shield': faShield,
  'check-circle': faCheckCircle,
  'link': faLink,
  'arrows-rotate': faArrowsRotate,
  'sparkles': faWandMagicSparkles,
  'paperclip': faPaperclip,
  'microphone': faMicrophone,
  'expand': faExpand,
  'compress': faCompress,
  'down-left-and-up-right-to-center': faDownLeftAndUpRightToCenter,
  'xmark': faXmark,
  'circle-arrow-up': faCircleArrowUp,
  'paper-plane': faPaperPlane,
  'eye-slash': faEyeSlash,
  'users': faUsers,
  'circle-plus': faCirclePlus,
  'bullseye': faBullseye,
  'bullhorn': faBullhorn,
  'clipboard': faClipboard,
  'compass': faCompass,
  'eye': faEye,
  'temperature-half': faTemperatureHalf,
  'star': faStar,
  'circle-x': faCircleXmark,
  'piggy-bank': faPiggyBank,
  'computer': faComputer,
  'megaphone': faBullhorn,
  'passport': faPassport,
  'phone': faPhone,
  'circle': faCircle,
  'circle-regular': faCircleRegular,
  'check': faCheck,
  'user-lock': faUserLock,
  'user-check': faUserCheck,
  'ban': faBan,
  'angle-left': faAngleLeft,
  'house': faHouse,
  'laptop': faLaptop,
  'house-building': faBuilding,
  'house-laptop': faLaptop,
  'spinner': faSpinner,
  'arrow-left': faArrowLeft,
  'rotate-left': faRotateLeft,
} as const;

export function Icon({ name, size = 24, className = '', variant = 'solid', style }: IconProps) {
  // Handle Lucide icons (for expand/collapse)
  if (name === 'arrow-right-from-line') {
    return (
      <PanelLeftOpen
        size={size}
        className={className}
        strokeWidth={2.25}
      />
    );
  }

  if (name === 'arrow-left-from-line') {
    return (
      <PanelLeftClose
        size={size}
        className={className}
        strokeWidth={2.25}
      />
    );
  }

  // Handle Lucide nav icons
  if (name === 'home-lucide') {
    return <Home size={size} className={className} strokeWidth={1.5} />;
  }

  if (name === 'user-circle-lucide') {
    return <UserCircle size={size} className={className} strokeWidth={1.5} />;
  }

  if (name === 'users-lucide') {
    return <Users size={size} className={className} strokeWidth={1.5} />;
  }

  if (name === 'id-card-lucide') {
    return <IdCard size={size} className={className} strokeWidth={1.5} />;
  }

  if (name === 'pie-chart-lucide') {
    return <PieChart size={size} className={className} strokeWidth={1.5} />;
  }

  if (name === 'file-text-lucide') {
    return <FileText size={size} className={className} strokeWidth={1.5} />;
  }

  if (name === 'circle-dollar-lucide') {
    return <CircleDollarSign size={size} className={className} strokeWidth={1.5} />;
  }

  if (name === 'sun') {
    return <Sun size={size} className={className} strokeWidth={2.25} />;
  }

  if (name === 'moon') {
    return <Moon size={size} className={className} strokeWidth={2.25} />;
  }

  if (name === 'zoom-in') {
    return <ZoomIn size={size} className={className} strokeWidth={1.5} />;
  }

  if (name === 'zoom-out') {
    return <ZoomOut size={size} className={className} strokeWidth={1.5} />;
  }

  if (name === 'file-export') {
    // Use arrow-up-from-bracket as export icon
    return <FontAwesomeIcon icon={faArrowUpFromBracket} fontSize={size} className={className} />;
  }

  if (name === 'grid-2-plus') {
    return <Grid2x2Plus size={size} className={className} strokeWidth={2.5} style={style} />;
  }

  if (name === 'circle-plus-lined') {
    return <CirclePlus size={size} className={className} strokeWidth={1.5} style={style} />;
  }

  // Custom benefits icon (heart/hand SVG)
  if (name === 'benefits') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={style}
      >
        <path
          d="M12 7.6875L10.4062 6.09375L9.84375 5.53125C8.8125 4.54688 7.35938 4.07812 5.95312 4.3125C3.79688 4.6875 2.25 6.51562 2.25 8.71875V8.95312C2.25 10.0781 2.625 11.1562 3.32812 12H5.71875C6.04688 12 6.28125 11.8594 6.42188 11.5781L7.92188 7.96875C8.01562 7.6875 8.29688 7.54688 8.57812 7.54688C8.90625 7.54688 9.14062 7.6875 9.28125 7.96875L12 14.0156L14.2969 9.42188C14.4375 9.1875 14.6719 9.04688 14.9531 9.04688C15.2344 9.04688 15.5156 9.1875 15.6562 9.42188L16.7344 11.625C16.875 11.8594 17.1094 12 17.3906 12H20.625C21.3281 11.1562 21.7031 10.0781 21.7031 8.95312V8.71875C21.7031 6.51562 20.1562 4.6875 18 4.3125C16.5938 4.07812 15.1406 4.54688 14.1094 5.53125L13.5469 6.09375L12 7.6875ZM21.375 13.5H19.0781H17.3906C16.5469 13.5 15.7969 13.0312 15.375 12.2812L15 11.4375L12.6562 16.125C12.5156 16.3594 12.2344 16.5469 11.9531 16.5C11.6719 16.5 11.4375 16.3594 11.2969 16.0781L8.625 10.1719L7.82812 12.1406C7.45312 12.9844 6.65625 13.5 5.71875 13.5H4.875H2.625H1.64062C0.5625 12.2812 0 10.6406 0 8.95312V8.71875C0 5.4375 2.34375 2.625 5.57812 2.10938C7.73438 1.73438 9.89062 2.4375 11.4375 3.9375L12 4.5L12.5625 3.9375C14.0625 2.4375 16.2656 1.73438 18.375 2.10938C21.6094 2.625 24 5.4375 24 8.71875V8.95312C24 10.6406 23.3906 12.2344 22.3125 13.5H21.375ZM3.1875 15H6.46875L12 20.1562L17.4844 15H20.7656L13.2656 22.0312C12.9375 22.3594 12.4688 22.5 12 22.5C11.4844 22.5 11.0156 22.3594 10.6875 22.0312L3.1875 15Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  // Handle icons that need Lucide for regular variant
  if (name === 'inbox' && variant === 'regular') {
    return <Inbox size={size} className={className} strokeWidth={2.25} style={style} />;
  }

  if (name === 'gear' && variant === 'regular') {
    return <Settings size={size} className={className} strokeWidth={2.25} style={style} />;
  }

  if (name === 'home' && variant === 'regular') {
    return <Home size={size} className={className} strokeWidth={2.25} style={style} />;
  }

  if (name === 'user-group' && variant === 'regular') {
    return <Users size={size} className={className} strokeWidth={2.25} style={style} />;
  }

  if (name === 'chart-pie-simple' && variant === 'regular') {
    return <PieChart size={size} className={className} strokeWidth={2.25} style={style} />;
  }

  // Handle Font Awesome icons
  const iconKey = variant === 'regular' && `${name}-regular` in faIconMap
    ? `${name}-regular` as keyof typeof faIconMap
    : name as keyof typeof faIconMap;

  const icon = faIconMap[iconKey];

  if (!icon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      style={{ width: size, height: size, ...style }}
      className={className}
    />
  );
}

export default Icon;
