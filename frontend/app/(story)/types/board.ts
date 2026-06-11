import type { BoardListSort } from '../constants/boardSort';

export type BoTable = 'review' | 'success' | 'column' | 'news';
export type BoardSearchField = 'subject' | 'content' | 'subject_content' | 'name';
export type { BoardListSort };

export type BoardListItem = {
  wr_id: number;
  wr_subject: string;
  wr_name: string;
  wr_datetime: string;
  wr_hit: number;
  has_file: boolean;
  thumbnail_url: string | null;
};

export type BoardListResponse = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  q?: string;
  sfl?: BoardSearchField;
  sort?: BoardListSort;
  items: BoardListItem[];
};

export type BoardFile = {
  no: number;
  source: string;
  url: string | null;
  size: number;
  is_image: boolean;
  width: number | null;
  height: number | null;
  has_password: boolean;
};

export type BoardNavItem = {
  wr_id: number;
  wr_subject: string;
} | null;

export type BoardView = {
  wr_id: number;
  wr_subject: string;
  wr_content: string;
  wr_name: string;
  wr_datetime: string;
  wr_hit: number;
  wr_seo_description?: string;
  wr_schema?: string;
  prev: BoardNavItem;
  next: BoardNavItem;
  files: BoardFile[];
};
