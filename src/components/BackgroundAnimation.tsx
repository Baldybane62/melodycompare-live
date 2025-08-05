
import React, { useRef, useEffect } from 'react';

const BackgroundAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let notes: Note[] = [];
        
        const noteChars = ['♪', '♫', '♩', '♬'];
        const colors = ['rgba(217, 70, 239,', 'rgba(14, 165, 233,'];

        class Note {
            x: number;
            y: number;
            size: number;
            char: string;
            color: string;
            vy: number;
            opacity: number;

            constructor(x: number, y: number, size: number, char: string, color: string, vy: number, opacity: number) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.char = char;
                this.color = color;
                this.vy = vy;
                this.opacity = opacity;
            }

            draw() {
                if(!ctx) return;
                ctx.font = `${this.size}px Arial`;
                // Construct the full rgba color string with opacity
                ctx.fillStyle = this.color + this.opacity + ')';
                ctx.fillText(this.char, this.x, this.y);
            }

            update() {
                // Move note up
                this.y -= this.vy;

                // Reset note to the bottom if it goes off the top
                if (this.y < -this.size) {
                    this.y = canvas.height + this.size;
                    this.x = Math.random() * canvas.width;
                    this.size = Math.random() * 20 + 15; // Reset size
                    this.vy = Math.random() * 0.5 + 0.2; // Reset speed
                }

                this.draw();
            }
        }

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            notes = [];
            const numberOfNotes = (canvas.width * canvas.height) / 18000;
            for (let i = 0; i < numberOfNotes; i++) {
                const size = Math.random() * 20 + 15; // size between 15 and 35
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const vy = Math.random() * 0.5 + 0.2; // vertical speed between 0.2 and 0.7
                const char = noteChars[Math.floor(Math.random() * noteChars.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const opacity = Math.random() * 0.4 + 0.1; // opacity between 0.1 and 0.5
                notes.push(new Note(x, y, size, char, color, vy, opacity));
            }
        };
        
        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            notes.forEach(p => p.update());
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            cancelAnimationFrame(animationFrameId);
            init();
            animate();
        };

        init();
        animate();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
            }}
        />
    );
};

export default BackgroundAnimation;
