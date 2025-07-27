import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Elite data professionals, vetted & ready
            </div>
            
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-8">
              Data talent.
              <br />
              <span className="text-muted-foreground">On demand.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with world-class data scientists, ML engineers, and analysts. 
              No noise, no friction—just exceptional talent.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8" asChild>
                <Link href="/auth/signup/client">
                  Hire talent
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                <Link href="/auth/signup/freelancer">Find work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Curated experts</h3>
              <p className="text-muted-foreground leading-relaxed">
                Hand-picked professionals with proven track records in data science and ML.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Transparent pricing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Clear, upfront rates with no hidden fees or markup surprises.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Instant matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                Smart algorithms connect you with the perfect talent in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join the future of data talent acquisition.
            </p>
            <Button size="lg" className="h-12 px-8" asChild>
              <Link href="/auth/signup">
                Get started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium">🥷 HireDataNinjas</span>
            </div>
            <div className="flex space-x-8 text-sm text-muted-foreground">
              <Link href="/jobs" className="hover:text-foreground transition-colors">Browse jobs</Link>
              <Link href="/freelancers" className="hover:text-foreground transition-colors">Find talent</Link>
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 HireDataNinjas. Built for the future of work.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
