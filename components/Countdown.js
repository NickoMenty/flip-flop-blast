import { useEffect, useState } from "react"

export default function CountdownTimer() {
    const [hasMounted, setHasMounted] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0) 

    function getEndTime() {
        const now = new Date();
        const resetHour = 0; 
    
        let endTime = new Date(now);
        endTime.setUTCHours(resetHour, 0, 0, 0); 
        
        if (now.getUTCHours() >= resetHour) {
            endTime.setUTCDate(endTime.getUTCDate() + 1);
        }
    
        return endTime.getTime();
    }

    function calculateTimeLeft() {
        const endTime = getEndTime()
        const difference = endTime - new Date().getTime()
        return difference > 0 ? difference : 0 
    }

    useEffect(() => {
        if (!hasMounted) {
            setHasMounted(true)
            setTimeLeft(calculateTimeLeft())
        }

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft()
            setTimeLeft(newTimeLeft)

            if (newTimeLeft === 0) {
                clearInterval(timer)
                if (typeof window !== "undefined") {
                    localStorage.removeItem('countdownEndTime')
                }
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [hasMounted])

    if (!hasMounted) {
        return null 
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    return (
        <div className="timer" >
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    )
}
