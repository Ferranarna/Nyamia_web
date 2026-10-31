import f1 from '@nyamia/brand/assets/frame-1.svg?url'
import f2 from '@nyamia/brand/assets/frame-2.svg?url'
import f3 from '@nyamia/brand/assets/frame-3.svg?url'
import f4 from '@nyamia/brand/assets/frame-4.svg?url'
import f5 from '@nyamia/brand/assets/frame-5.svg?url'
import f6 from '@nyamia/brand/assets/frame-6.svg?url'
import { cn } from '../../lib/cn'

export const COOKIE_FRAMES = [f1, f2, f3, f4, f5, f6]

/** The app's LoadingCookie flipbook: the six real frames, CSS steps. Static last frame under reduced motion. */
export function CookieLoader({ size = 64, className }: { size?: number; className?: string }) {
  const w = size * (204 / 266)
  return (
    <span className={cn('inline-block overflow-hidden', className)} style={{ width: w, height: size }}>
      <span className="cookie-strip flex" style={{ width: w * 6 }}>
        {COOKIE_FRAMES.map((src) => (
          <img key={src} src={src} alt="" width={w} height={size} className="block shrink-0" />
        ))}
      </span>
    </span>
  )
}
