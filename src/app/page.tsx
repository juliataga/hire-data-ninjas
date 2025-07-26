import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            🥷 HireDataNinjas
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The Curated Marketplace for 
            <span className="text-blue-600"> Data Professionals</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with vetted data scientists, analysts, and ML engineers. 
            Transparent pricing, quality talent, no hidden fees.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup/client">
              <Button size="lg" className="w-full sm:w-auto">
                Hire Data Talent
              </Button>
            </Link>
            <Link href="/auth/signup/freelancer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Find Data Jobs
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Curated Talent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Hand-picked data professionals with verified skills and experience
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💎 Transparent Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Simple subscription model. No hidden fees or commission markups.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚡ Fast Matching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI-powered matching gets you connected with the right talent quickly
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Preview */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Simple, Transparent Pricing</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>For Freelancers</CardTitle>
                    <Badge variant="secondary">Popular</Badge>
                  </div>
                  <div className="text-3xl font-bold">$20<span className="text-lg text-gray-600">/month</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="text-left space-y-2 text-sm">
                    <li>✓ Apply to unlimited jobs</li>
                    <li>✓ Professional profile</li>
                    <li>✓ Direct client messaging</li>
                    <li>✓ Skill verification</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>For Clients</CardTitle>
                  <div className="text-3xl font-bold">$30<span className="text-lg text-gray-600">/month</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="text-left space-y-2 text-sm">
                    <li>✓ Post unlimited jobs</li>
                    <li>✓ Access curated talent</li>
                    <li>✓ Advanced search filters</li>
                    <li>✓ Analytics dashboard</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 HireDataNinjas. Building the future of data talent.</p>
        </div>
      </footer>
    </div>
  )
}
