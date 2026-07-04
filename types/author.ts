/** 執筆者・監修者マスタの型定義(設計書06章 §2-3)。データ本体は data/authors.ts */
export interface Author {
  id: string
  slug: string // /supervisor/<slug>/
  name: string
  role: 'editor' | 'supervisor'
  credentials: string[] // ['介護福祉士', '介護支援専門員']
  experienceYears?: number
  bio: string
  sameAs?: string[] // SNS・外部実績URL(Person schema に出力)
  avatar?: string
}
