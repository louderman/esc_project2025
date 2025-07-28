<<<<<<< HEAD
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
=======
import { Card, CardContent } from "@/components/hotel/ui/card";
import { Button } from "@/components/hotel/ui/button";
import { Badge } from "@/components/hotel/ui/badge";
>>>>>>> origin/main
import { Users, Bed, Check } from "lucide-react";

interface Room {
  id: string;
  room_type: string;
  price: number;
  free_cancellation: boolean;
  image: string;
  occupancy?: number;
  bed_type?: string;
  size?: string;
}

interface RoomOptionsProps {
  rooms: Room[];
}

const RoomOptions = ({ rooms }: RoomOptionsProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Available Rooms</h2>
      
      <div className="space-y-4">
        {rooms.map((room) => (
          <Card key={room.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <img 
                    src={room.image} 
                    alt={room.room_type}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{room.room_type}</h3>
                      <div className="flex items-center space-x-4 text-sm text-hotel-text-secondary mb-3">
                        <div className="flex items-center space-x-1">
                          <Users size={16} />
                          <span>{room.occupancy || 2} guests</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Bed size={16} />
                          <span>{room.bed_type || "King bed"}</span>
                        </div>
                        {room.size && (
                          <span>{room.size} m²</span>
                        )}
                      </div>
                      
                      {room.free_cancellation && (
                        <Badge variant="secondary" className="bg-green-50 text-green-700 mb-3">
                          <Check size={12} className="mr-1" />
                          Free Cancellation
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-1">${room.price}</div>
                      <div className="text-sm text-hotel-text-secondary mb-3">per night</div>
                      <Button className="bg-primary hover:bg-primary/90">
                        Select Room
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-hotel-text-secondary">
                    <p>Includes: Free WiFi, Air conditioning, Private bathroom</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoomOptions;