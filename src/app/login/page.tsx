'use client'

import { useState } from 'react'
import { signInWithGoogle } from '@/lib/supabase/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, LogIn } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error('ログインに失敗しました: ' + error.message)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('予期せぬエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sky flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            UniVerse Canvas
          </CardTitle>
          <CardDescription className="text-base">
            管理画面にアクセスするにはログインが必要です。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <Button 
            onClick={handleSignIn} 
            disabled={isLoading}
            size="lg" 
            className="w-full gap-3 text-lg font-medium"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            Googleでログイン
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Authorized access only
              </span>
            </div>
          </div>
          
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            ログインすることで、当サイトの利用規約およびプライバシーポリシーに同意したものとみなされます。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
