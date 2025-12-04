import Spline from '@splinetool/react-spline/next'

export function SplineBackground() {
  return (
    <div className="spline-background sticky top-0 w-full z-0 pointer-events-none" style={{ marginTop: 0, paddingTop: 0, height: 'calc(100vh - 50px)', clipPath: 'inset(0 0 50px 0)' }}>
      <div className="w-full h-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-48">
        <div className="w-full h-full translate-y-8 sm:translate-y-16 md:translate-y-24 scale-150 sm:scale-175 md:scale-200">
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <Spline scene="https://prod.spline.design/lzqdiUivvSwKYvU9/scene.splinecode" />
          </div>
          {/* Overlay escuro para melhorar legibilidade */}
          <div className="absolute inset-0 bg-black/40 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

