import { Button } from "@/components/hotel/ui/button";
import { Input } from "@/components/hotel/ui/input";
import { Search, MapPin, Phone, Globe } from "lucide-react";

const HotelHeader = () => {
  return (
    <header className="bg-primary py-4 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary-foreground">Hotels.com</h1>
          </div>
          <div className="flex items-center space-x-4 text-primary-foreground text-sm">
            <div className="flex items-center space-x-1">
              <Phone size={16} />
              <span>Help</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe size={16} />
              <span>English</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input 
              placeholder="Search destinations, properties..." 
              className="pl-10 bg-background border-0 shadow-sm"
            />
          </div>
          <Button variant="secondary" size="sm">
            Search
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HotelHeader;