import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🥷 HireDataNinjas
          </h1>
          <p className="text-gray-600">
            Join the curated marketplace for data professionals
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-center">
                💻 Join as Freelancer
              </CardTitle>
              <CardDescription className="text-center">
                Find amazing data science opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li>✓ Apply to unlimited jobs</li>
                <li>✓ Build professional profile</li>
                <li>✓ Direct client messaging</li>
                <li>✓ Skill verification badges</li>
              </ul>
              <Link href="/auth/signup/freelancer">
                <Button className="w-full">
                  Get Started as Freelancer
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-center">
                🏢 Join as Client
              </CardTitle>
              <CardDescription className="text-center">
                Hire top data science talent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li>✓ Post unlimited jobs</li>
                <li>✓ Access curated talent pool</li>
                <li>✓ Advanced search filters</li>
                <li>✓ Analytics dashboard</li>
              </ul>
              <Link href="/auth/signup/client">
                <Button className="w-full">
                  Get Started as Client
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
