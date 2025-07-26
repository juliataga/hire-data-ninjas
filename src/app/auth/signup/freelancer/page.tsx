import { SignupForm } from '@/components/auth/signup-form'

export default function FreelancerSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🥷 HireDataNinjas
          </h1>
          <p className="text-gray-600">
            Join as a freelancer and find amazing opportunities
          </p>
        </div>
        <SignupForm userType="freelancer" />
      </div>
    </div>
  )
}
