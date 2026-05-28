export type BoTable = 'review' | 'success' | 'column' | 'news';

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
  items: BoardListItem[];
};

export type BoardFile = {
  no: number;
  source: string;
  url: string;
  size: number;
  is_image: boolean;
  width: number | null;
  height: number | null;
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
  prev: BoardNavItem;
  next: BoardNavItem;
  files: BoardFile[];
};
