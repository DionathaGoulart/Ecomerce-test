import Spline from '@splinetool/react-spline/next'

export function SplineBackground() {
  return (
    <div className="spline-background sticky top-0 w-full z-0 pointer-events-none m-0 p-0 h-[calc(100vh-50px)] md:h-[calc(100vh-50px)] xl:h-[calc(100vh-20px)] 3xl:h-[calc(100vh-20px)] spline-clip-path" style={{ zIndex: 0 }}>
      <div className="w-full h-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 3xl:px-40">
        <div className="w-full h-full translate-y-8 sm:translate-y-16 md:translate-y-24 xl:translate-y-12 3xl:translate-y-14 2xl:translate-y-24 scale-[1.15] sm:scale-175 md:scale-200 lg:scale-200 2xl:scale-200 spline-scale-custom">
          <div className="w-full h-full rounded-2xl overflow-hidden [&_canvas]:bg-transparent">
            <Spline 
              scene="https://prod.spline.design/lzqdiUivvSwKYvU9/scene.splinecode"
              style={{ background: 'transparent' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

