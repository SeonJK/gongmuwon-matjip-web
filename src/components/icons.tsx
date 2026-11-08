type P = { size?: number };
const base = (size = 22) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

export const SearchIcon = ({ size }: P) => (
  <svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
export const MenuIcon = ({ size }: P) => (
  <svg {...base(size)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
export const CloseIcon = ({ size }: P) => (
  <svg {...base(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const LocateIcon = ({ size }: P) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
);
export const StarIcon = ({ size, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} fill={filled ? "currentColor" : "none"}><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" /></svg>
);
export const LayersIcon = ({ size }: P) => (
  <svg {...base(size)}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></svg>
);
export const BellIcon = ({ size }: P) => (
  <svg {...base(size)}><path d="M6 16V11a6 6 0 1112 0v5l2 2H4l2-2z" /><path d="M10 21h4" /></svg>
);
export const PhoneIcon = ({ size }: P) => (
  <svg {...base(size)}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></svg>
);
export const RouteIcon = ({ size }: P) => (
  <svg {...base(size)}><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h8a3 3 0 000-6H8a3 3 0 010-6h8" /></svg>
);
