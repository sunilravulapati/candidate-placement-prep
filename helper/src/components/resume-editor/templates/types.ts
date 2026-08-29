export type TemplateId = 'modern' | 'classic' | 'minimal';

export type Density = 'compact' | 'standard' | 'relaxed';

export type PaperSize = 'a4' | 'letter';

export interface TemplateProps {
  resumeJson: any;
  density?: Density;
}
