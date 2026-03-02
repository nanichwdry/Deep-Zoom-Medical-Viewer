export interface Point {
  x: number;
  y: number;
}

export interface ViewState {
  offset: Point;
  scale: number;
}

export interface ImageMetadata {
  id: string;
  patientName: string;
  modality: string;
  date: string;
  resolution: string;
  url: string;
}

export interface Annotation {
  id: string;
  points: Point[];
  color: string;
  label: string;
}

export interface AnnotationColor {
  color: string;
  label: string;
  code: string;
}
