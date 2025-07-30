import { User } from '@supabase/supabase-js';
import { UserMenu } from './UserMenu';
import { Button } from './ui/button';
import { LogIn, Sparkles } from 'lucide-react';

interface CosmicHeaderProps {
  user: User | null;
  profile: any;
  onAuthClick: () => void;
}

export const CosmicHeader = ({ user, profile, onAuthClick }: CosmicHeaderProps) => {
  return (
    <header className="relative z-20 border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-stardust flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-cosmic">
              AstroVibe
            </h1>
          </div>

          {/* Auth section */}
          <div className="flex items-center">
            {user ? (
              <UserMenu user={user} profile={profile} />
            ) : (
              <Button
                onClick={onAuthClick}
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};