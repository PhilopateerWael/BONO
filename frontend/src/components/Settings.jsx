import { useEffect, useRef, useState } from 'react'
import { Trash2, Info } from 'lucide-react'

const LOCAL_KEY = 'rewardVideoSrc'

const Settings = () => {
    const [videoSrc, setVideoSrc] = useState('')
    const [message, setMessage] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_KEY)
        if (saved) setVideoSrc(saved)
    }, [])

    const onSelectFile = async (e) => {
        const file = e.target.files && e.target.files[0]
        if (!file) return
        if (!file.type.startsWith('video/')) {
            setMessage('Please select a video file.')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            try {
                localStorage.setItem(LOCAL_KEY, reader.result)
                setVideoSrc(String(reader.result))
                setMessage('Custom reward video saved!')
            } catch (err) {
                setMessage('Failed to save in local storage (file too large). Try a shorter video.')
            }
        }
        reader.onerror = () => setMessage('Could not read file. Please try again.')
        reader.readAsDataURL(file)
    }

    const clearCustom = () => {
        localStorage.removeItem(LOCAL_KEY)
        setVideoSrc('')
        setMessage('Reverted to default video.')
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className='min-h-screen'>
            <div className='glass-strong border-b border-white/10'>
                <div className='max-w-3xl mx-auto w-full p-4 sm:p-6'>
                    <h1 className='text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 sm:mb-2'>Settings</h1>
                    <p className='text-gray-300 text-sm sm:text-base'>Customize your reward experience.</p>
                </div>
            </div>

            <div className='max-w-3xl mx-auto w-full p-4 sm:p-6'>
                <div className='glass rounded-xl border border-white/10 p-4 sm:p-5'>
                    <h3 className='text-white font-semibold mb-3'>Reward Video</h3>
                    <p className='text-gray-300 text-sm flex items-start gap-2 mb-3'>
                        <Info size={16} className='text-white/70 mt-0.5' />
                        Upload a short MP4/WebM. It will be saved in your browser storage (not uploaded to server) and played when you complete a habit.
                    </p>
                    <div className='flex flex-col sm:flex-row gap-3 sm:items-center'>
                        <input
                            ref={inputRef}
                            type='file'
                            accept='video/*'
                            onChange={onSelectFile}
                            className='block w-full text-sm text-gray-300 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/15 cursor-pointer border border-white/10 rounded-xl p-1.5 bg-white/5'
                        />
                        <button
                            onClick={clearCustom}
                            className='cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-white/10'
                        >
                            <Trash2 size={16} /> Reset to default
                        </button>
                    </div>
                    {message && <p className='text-xs text-gray-400 mt-2'>{message}</p>}

                    <div className='mt-4'>
                        <h4 className='text-white font-medium mb-2 text-sm'>Preview</h4>
                        <div className='bg-white/5 border border-white/10 rounded-xl p-3'>
                            {videoSrc ? (
                                <video src={videoSrc} controls className='w-full rounded-lg' />
                            ) : (
                                <div className='text-gray-400 text-sm'>Using default reward video.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
