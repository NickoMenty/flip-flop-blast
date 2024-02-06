import { useEffect, useState } from "react"

export default function CountdownTimer() {
    const [hasMounted, setHasMounted] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0) // Initialize timeLeft with a default value

    // Define getEndTime function
    function getEndTime() {
        const now = new Date();
        const resetHour = 0; // Set the reset hour (0 for midnight)
    
        // Create a date object for the next reset time
        let endTime = new Date(now);
        endTime.setUTCHours(resetHour, 0, 0, 0); // Set to the next reset time (e.g., midnight UTC)
    
        // If current time is past today's reset time, set endTime to the next day's reset time
        if (now.getUTCHours() >= resetHour) {
            endTime.setUTCDate(endTime.getUTCDate() + 1);
        }
    
        return endTime.getTime();
    }

    // Define calculateTimeLeft function
    function calculateTimeLeft() {
        const endTime = getEndTime()
        const difference = endTime - new Date().getTime()
        return difference > 0 ? difference : 0 // Ensure timeLeft is not negative
    }

    useEffect(() => {
        // Ensure this runs only after the component mounts
        if (!hasMounted) {
            setHasMounted(true)
            setTimeLeft(calculateTimeLeft()) // Initialize timeLeft
        }

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft()
            setTimeLeft(newTimeLeft)

            if (newTimeLeft === 0) {
                clearInterval(timer)
                if (typeof window !== "undefined") {
                    localStorage.removeItem('countdownEndTime') // Clear the stored end time
                }
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [hasMounted])

    if (!hasMounted) {
        // Return null or a placeholder while the component is mounting
        return null // or <div>Loading...</div> for a loading state
    }

    // Calculate hours, minutes, and seconds from timeLeft
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    return (
        <div className="timer" style={{color: "white"}}>
            The raffle will close in: {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    )
}
