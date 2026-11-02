'use client'

import { useRooms } from '@/lib/hooks/useRooms'
import type { Room } from '@/lib/supabase/client'

export default function RoomList({ onSelectRoom }: { onSelectRoom: (room: Room) => void }) {
  const { rooms, loading, deleteRoom } = useRooms()

  if (loading) {
    return <div className="text-center py-8">Loading rooms...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Daftar Room</h2>
      {rooms.length === 0 ? (
        <p className="text-gray-500">Belum ada room. Buat yang baru!</p>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div
                onClick={() => onSelectRoom(room)}
                className="flex-1 cursor-pointer"
              >
                <p className="font-semibold text-blue-600 hover:underline">{room.id}</p>
                <p className="text-xs text-gray-500">
                  Dibuat: {new Date(room.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Hapus room ini?')) {
                    deleteRoom(room.id)
                  }
                }}
                className="text-red-600 hover:text-red-700 text-sm px-3"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
