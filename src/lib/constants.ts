// Static options and defaults. Preset colors mirror the mat-* tokens in design-system/tokens.json.

export type LayerKey =
  | 'grid' | 'mm' | 'quilt' | 'iso' | 'circle' | 'dots' | 'cross'
  | 'fib' | 'angles' | 'frame' | 'ruler' | 'label';
export type ShadowStyle = 'stripes' | 'blinds' | 'window' | 'leaves' | 'gradient';

export interface State {
  bg: string;
  ink: 'auto' | 'custom';
  inkCustom: string;
  intensity: number;
  layers: Record<LayerKey, boolean>;
  fibSide: 'left' | 'right';
  cw: number;
  ch: number;
  cell: number;
  shadow: boolean;
  shadowAmt: number;
  seed: number;
  shadowStyle: ShadowStyle;
  plate: boolean;
  quoteOn: boolean;
  quote: string;
  quoteSize: number;
  font: string;
  bodyOn: boolean;
  body: string;
  bodyCols: number;
  label: string;
}

export type SetState = (patch: Partial<State>) => void;

export interface Preset { name: string; bg: string; intensity: number }

export const DEFAULT_STATE: State = {
  bg: '#1c9272',
  ink: 'auto',
  inkCustom: '#ffffff',
  intensity: 100,
  layers: {
    grid: true, mm: false, quilt: false, iso: false, circle: false, dots: false, cross: false,
    fib: false, angles: true, frame: true, ruler: true, label: true,
  },
  fibSide: 'left',
  cw: 2560,
  ch: 1600,
  cell: 0.95,
  shadow: false,
  shadowAmt: 70,
  seed: 7,
  shadowStyle: 'stripes',
  plate: true,
  quoteOn: true,
  quote: 'Stay Sharp.',
  quoteSize: 1,
  font: 'Newsreader',
  bodyOn: true,
  body: 'Dull tools make tired hands. Rest, sharpen your skills, and return to the work with an edge that makes the hard parts feel easy.',
  bodyCols: 3,
  label: 'CAT MUT - CUT MAT WALLPAPER PACK\n{ratio} ASPECT RATIO - {year}',
};

export const PRESETS: Preset[] = [
  { name: 'เขียว', bg: '#1c9272', intensity: 100 },
  { name: 'ถ่าน', bg: '#17181c', intensity: 50 },
  { name: 'เทาอ่อน', bg: '#d8d8d8', intensity: 100 },
  { name: 'ม่วงเข้ม', bg: '#382030', intensity: 75 },
  { name: 'ฟ้าม่วง', bg: '#7c8db2', intensity: 100 },
];

// [label, a, b]
export const RATIOS: [string, number, number][] = [
  ['16:10', 16, 10],
  ['16:9', 16, 9],
  ['21:9', 21, 9],
  ['3:2', 3, 2],
  ['4:3', 4, 3],
  ['1:1', 1, 1],
  ['19.5:9', 19.5, 9],
];

// [key, label, hint]
export const LAYERS: [LayerKey, string, string][] = [
  ['grid', 'เส้นกริด', 'กริดมาตรฐาน ช่องใหญ่และเส้นย่อย 5 ส่วน'],
  ['mm', 'มิลลิเมตร', 'กริดละเอียด 3 ระดับ (ช่อง ครึ่งช่อง 1/10 ช่อง) แบบกระดาษกราฟ'],
  ['quilt', 'ควิลท์ 45°', 'เส้นแนวทแยง 45° พาดเต็มแผ่นผ่านมุมช่องทุกจุด แบบแผ่นรองตัดงานควิลท์'],
  ['iso', 'สามเหลี่ยม 60°', 'ตารางสามเหลี่ยมด้านเท่า (ไอโซเมตริก) สำหรับตัดชิ้นสามเหลี่ยมและหกเหลี่ยม'],
  ['circle', 'วงกลม', 'วงกลมซ้อนรอบจุดกลาง พร้อมเส้นกากบาทกลางและเส้นทแยง แบบแผ่นตัดวงกลมด้วยใบมีดหมุน'],
  ['dots', 'จุด', 'จุดตามจุดตัดกริด จุดใหญ่ทุกช่องหลัก'],
  ['cross', 'กากบาท', 'เครื่องหมายบวกเล็กๆ ตามจุดตัดกริด'],
  ['fib', 'Fibonacci', 'สี่เหลี่ยมขนาด 1 1 2 3 5 8 … ต่อกันเป็นสี่เหลี่ยมสัดส่วนทอง พร้อมเกลียวทองคำ'],
  ['angles', 'เส้นมุม 15°–75°', 'เส้นทแยง 45° และเส้นประ 15° 30° 60° 75° จากมุมซ้ายล่าง พร้อมตัวเลของศา'],
  ['label', 'ป้ายแนวตั้ง', 'ป้ายข้อความแนวตั้งมุมซ้ายบน อยู่ในเลเยอร์ล่างร่วมกับกริด แก้ข้อความได้ด้านล่าง'],
  ['frame', 'กรอบ', 'กรอบสี่เหลี่ยมรอบพื้นที่ลวดลาย'],
  ['ruler', 'ไม้บรรทัดขอบ', 'ขีดและตัวเลขรอบขอบด้านบน ซ้าย และขวา'],
];

export const SHADOWS: [ShadowStyle, string][] = [
  ['stripes', 'แถบเฉียง'],
  ['blinds', 'บานเกล็ด'],
  ['window', 'หน้าต่าง'],
  ['leaves', 'ใบไม้'],
  ['gradient', 'ไล่เฉด'],
];

export const SIZE_LIMITS = { min: 200, max: 12000 };

// Options for SVG export. PNG export omits `imports` because an <img> SVG cannot fetch @import.
export const EXPORT_SVG = { embed: true, imports: true };
export const EXPORT_PNG = { embed: true };
