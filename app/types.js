export type Category = {
  count: number,
  description: string,
  id: number,
  link: string,
  name: string,
  parent: number,
  slug: string,
  taxonomy: string,
}

export type Content = {
  protected: boolean,
  rendered: string,
}

export type Excerpt = {
  protected: boolean,
  rendered: string,
}

export type GUID = {
  rendered: string,
}

export type Match = {
  params: Object,
}

export type Title = {
  rendered: string,
}

export type CommonPage = {
  author: number,
  comment_status: string,
  content: Content,
  excerpt: Excerpt,
  featured_medua: number,
  guid: GUID,
  id: number,
  link: string,
  menu_order: number,
  parent: number,
  ping_status: number,
  slug: string,
  status: string,
  template: string,
  title: Title,
  type: 'string',
}

export type RawPage = CommonPage & {
  date: string,
  date_gmt: string,
  modified: string,
  modified_gmt: string,
}

export type Page = CommonPage & {
  date: Date,
  date_gmt: Date,
  modified: Date,
  modified_gmt: Date,
}

export type CommonPost = {
  author: number,
  categories: Array<number>,
  comment_status: boolean,
  content: Content,
  excerpt: Excerpt,
  featured_media: number,
  featured_media_url?: string,
  format: string,
  guid: GUID,
  id: number,
  link: string,
  ping_status: string,
  slug: string,
  status: string,
  sticky: boolean,
  tags: Array<number>,
  template: string,
  title: Title,
  type: 'post',
}

export type RawPost = CommonPost & {
  date: string,
  date_gmt: string,
  modified: string,
  modified_gmt: string,
}

export type Post = CommonPost & {
  date: Date,
  date_gmt: Date,
  modified: Date,
  modified_gmt: Date,
}
