export type UserRole = 'freelancer' | 'client' | 'admin'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  linkedin_url: string | null
  github_url: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: SubscriptionStatus
  price_id: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}
