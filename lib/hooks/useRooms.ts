import { useState, useEffect } from 'react'
import { supabase, type Room, type Message } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const { data } = await supabase.from('rooms').select('*').order('created_at', { ascending: false })
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async () => {
    try {
      const roomId = uuidv4().slice(0, 12)
      const token = uuidv4()

      const { data, error } = await supabase
        .from('rooms')
        .insert({ id: roomId, token })
        .select()
        .single()

      if (error) throw error
      setRooms([data, ...rooms])
      return { roomId, token }
    } catch (error) {
      console.error('Error creating room:', error)
      throw error
    }
  }

  const joinRoom = async (token: string) => {
    try {
      const { data, error } = await supabase.from('rooms').select('*').eq('token', token).single()

      if (error || !data) throw new Error('Room not found')
      return data as Room
    } catch (error) {
      console.error('Error joining room:', error)
      throw error
    }
  }

  const deleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId)
      if (error) throw error
      setRooms(rooms.filter((r) => r.id !== roomId))
    } catch (error) {
      console.error('Error deleting room:', error)
      throw error
    }
  }

  return { rooms, loading, createRoom, joinRoom, deleteRoom, refetch: fetchRooms }
}

export const useMessages = (roomId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!roomId) return

    fetchMessages()

    // Real-time subscription
    const subscription = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [roomId])

  const fetchMessages = async () => {
    if (!roomId) return
    try {
      setLoading(true)
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (sender: string, content: string) => {
    if (!roomId) throw new Error('No room selected')
    try {
      const { error } = await supabase.from('messages').insert({
        room_id: roomId,
        sender,
        content,
      })
      if (error) throw error
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  return { messages, loading, sendMessage, refetch: fetchMessages }
}
