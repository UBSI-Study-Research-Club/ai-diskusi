'use client'

import { useState } from 'react'
import { useRooms } from '@/lib/hooks/useRooms'

export default function CreateRoomModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { createRoom } = useRooms()
  const [loading, setLoading] = useState(false)
  const [roomData, setRoomData] = useState<{ roomId: string; token: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    try {
      setLoading(true)
      const data = await createRoom()
      setRoomData(data)
    } catch (error) {
      alert('Error creating room')
    } finally {
      setLoading(false)
    }
  }

  const copyToken = () => {
    if (roomData) {
      navigator.clipboard.writeText(roomData.token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Buat Room Baru</h2>

        {!roomData ? (
          <>
            <p className="text-gray-600 mb-4">Klik tombol di bawah untuk membuat room baru</p>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Membuat...' : 'Buat Room'}
            </button>
            <button
              onClick={onClose}
              className="w-full mt-2 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Tutup
            </button>
          </>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Room ID:</p>
              <p className="font-mono text-sm font-bold break-all">{roomData.roomId}</p>

              <p className="text-sm text-gray-600 mt-4 mb-2">Room Token (Bagikan ke orang lain):</p>
              <p className="font-mono text-sm font-bold break-all mb-3">{roomData.token}</p>

              <button
                onClick={copyToken}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
              >
                {copied ? '✓ Tersalin!' : 'Copy Token'}
              </button>
            </div>

            <button
              onClick={onSuccess}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Masuk ke Room
            </button>
          </>
        )}
      </div>
    </div>
  )
}
