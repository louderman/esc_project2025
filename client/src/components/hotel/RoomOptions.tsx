import { Card, CardContent } from "@/components/hotel/ui/card";
import { Button } from "@/components/hotel/ui/button";
import { Badge } from "@/components/hotel/ui/badge";
import { Users, Bed, Check, ImageOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { isValidImage, getImageWithFallback } from "@/utils/imageFallbacks";

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
  hotelId: string;
  hotelName: string;
  hotelRating: number;
  hotelReviewCount: number;
  onSelectRoom?: (room: Room) => void;
  totalAvailableRooms?: number;
}

const RoomOptions = ({ rooms, hotelId, hotelName, hotelRating, hotelReviewCount, onSelectRoom, totalAvailableRooms }: RoomOptionsProps) => {
  // Component for "No image available" card
  const NoImageCard = ({ roomType }: { roomType: string }) => (
    <div className="w-full h-48 md:h-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-3">
        <ImageOff size={24} className="text-gray-500" />
      </div>
      <h4 className="text-sm font-medium text-gray-700 mb-1">
        No Image Available
      </h4>
      <p className="text-xs text-gray-500">
        {roomType}
      </p>
    </div>
  );

  // Component for room image with error handling
  const RoomImage = ({ room }: { room: Room }) => {
    const [imageError, setImageError] = useState(false);

    if (!isValidImage(room.image) || imageError) {
      return <NoImageCard roomType={room.room_type} />;
    }

    return (
      <img 
        src={room.image} 
        alt={room.room_type}
        className="w-full h-48 md:h-full object-cover"
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Available Rooms</h2>
        {totalAvailableRooms && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-green-600" />
              <span className="text-green-800 font-semibold">
                {totalAvailableRooms} Total Rooms Available
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {rooms.map((room) => (
          <Card key={room.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <RoomImage room={room} />
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
                      <div className="text-sm text-hotel-text-secondary mb-3">total</div>
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => onSelectRoom?.(room)}
                      >
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