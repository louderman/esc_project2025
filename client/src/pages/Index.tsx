import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">Hotel Booking Demo</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Explore our beautiful hotel room details page
        </p>
        <Link to="/hotel/park-royal-singapore">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            View Hotel Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
