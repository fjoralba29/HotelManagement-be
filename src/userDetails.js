import database from "./databaseConnectivity.js";

export async function getUserDetails(userId) {
  const user = await database('CLIENTS')
    .where('CLIENTS.id', userId)
    .first();

  const room = await database('CLIENT_ROOM')
    .join('ROOMS', 'CLIENT_ROOM.room_id', 'ROOMS.id')
    .join('HOTELS', 'ROOMS.hotel_id', 'HOTELS.id')
    .where('CLIENT_ROOM.client_id', userId)
    .select(
      'CLIENT_ROOM.check_in_date',
      'CLIENT_ROOM.check_out_date',
      'ROOMS.type_of_room',
      'ROOMS.beds',
      'ROOMS.air_conditioner',
      'ROOMS.balcony',
      'ROOMS.price as room_price',
      'HOTELS.hotel_name',
      'HOTELS.address',
      'HOTELS.rating as hotel_rating'
    )
    .first();

  const trip = await database('CLIENT_TRIP')
    .join('TRIPS', 'CLIENT_TRIP.trip_id', 'TRIPS.id')
    .where('CLIENT_TRIP.client_id', userId)
    .select('TRIPS.place', 'TRIPS.time', 'TRIPS.itinerary', 'TRIPS.price as trip_price');

  return {
    user,
    room,
    trip
  };
}


