'use client'

import { useState, useEffect } from 'react'
import CreateRoomModal from '@/components/CreateRoomModal'
import ChatBox from '@/components/ChatBox'
import RoomList from '@/components/RoomList'
import type { Room } from '@/lib/supabase/client'

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinToken, setJoinToken] = useState('')
  const [joiningLoading, setJoiningLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('watsap-user')
    if (saved) {
      setCurrentUser(saved)
    }
  }, [])

  const handleSetUser = (name: string) => {
    setCurrentUser(name)
    localStorage.setItem('watsap-user', name)
  }

  const handleJoinRoom = async () => {
    if (!joinToken.trim()) {
      alert('Masukkan token room')
      return
    }

    try {
      setJoiningLoading(true)
      const { supabase } = await import('@/lib/supabase/client')
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('token', joinToken)
        .single()

      if (error || !data) {
        alert('Room tidak ditemukan')
        return
      }

      setSelectedRoom(data as Room)
      setShowJoinModal(false)
      setJoinToken('')
    } catch (error) {
      alert('Error joining room')
    } finally {
      setJoiningLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-96">
          <h1 className="text-3xl font-bold mb-6 text-center">Watsap Hermes</h1>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nama user / agent kamu"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  handleSetUser(e.currentTarget.value)
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                const input = document.querySelector('input')
                if (input?.value.trim()) {
                  handleSetUser(input.value)
                }
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Masuk
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedRoom) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Watsap Hermes</h1>
            <p className="text-sm opacity-90">Room: {selectedRoom.id}</p>
          </div>
          <button
            onClick={() => setSelectedRoom(null)}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
          >
            Kembali
          </button>
        </div>
        <div className="flex-1">
          <ChatBox roomId={selectedRoom.id} currentUser={currentUser} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">Watsap Hermes</h1>
          <p className="text-sm opacity-90">Multi-Agent Chat Room Platform</p>
          <p className="text-sm mt-2">User: {currentUser}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Aksi</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                + Buat Room Baru
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                + Join Room
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('watsap-user')
                  setCurrentUser('')
                }}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <RoomList onSelectRoom={setSelectedRoom} />
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Join Room</h2>
            <input
              type="text"
              value={joinToken}
              onChange={(e) => setJoinToken(e.target.value)}
              placeholder="Paste token room di sini"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleJoinRoom}
                disabled={joiningLoading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {joiningLoading ? 'Joining...' : 'Join'}
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
