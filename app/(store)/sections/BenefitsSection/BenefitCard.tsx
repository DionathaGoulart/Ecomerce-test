import Image from 'next/image'

export interface LineConfig {
  svgWidth: number
  svgHeight: number
  viewBox: string
  position: 'left' | 'right'
  horizontalLine?: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
  verticalLine?: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
  circle?: {
    cx: number
    cy: number
  }
}

interface BenefitCardProps {
  index: number
  icon: string
  title: string
  description: string
  lineConfig: LineConfig
  cardRef: (el: HTMLDivElement | null) => void
  className?: string
}

export function BenefitCard({ index, icon, title, description, lineConfig, cardRef, className = '' }: BenefitCardProps) {
  return (
    <div ref={cardRef} className={`relative ${className}`}>
      <div className="p-4 sm:p-6 md:p-8 bg-white/5 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/10 w-full sm:w-[273px]">
        <div className="flex flex-col gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <Image
              src={icon}
              alt=""
              width={16}
              height={16}
              className="w-4 h-4"
            />
          </div>
          <h3 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-white leading-tight">
            {title.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < title.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h3>
          <p className="text-[10px] sm:text-[11px] md:text-[12px] text-white/80 leading-tight">
            {description}
          </p>
        </div>
      </div>
      {/* Linha decorativa */}
      <svg 
        className={`hidden lg:block absolute top-1/2 ${lineConfig.position === 'left' ? 'left-full' : 'right-full'} pointer-events-none`}
        width={lineConfig.svgWidth}
        height={lineConfig.svgHeight}
        viewBox={lineConfig.viewBox}
        style={{ transform: 'translateY(-50%)' }}
      >
        {lineConfig.horizontalLine && (
          <line 
            x1={lineConfig.horizontalLine.x1}
            y1={lineConfig.horizontalLine.y1}
            x2={lineConfig.horizontalLine.x2}
            y2={lineConfig.horizontalLine.y2}
            stroke="white"
            strokeWidth="1"
            opacity="0.3"
          />
        )}
        {lineConfig.verticalLine && (
          <line 
            x1={lineConfig.verticalLine.x1}
            y1={lineConfig.verticalLine.y1}
            x2={lineConfig.verticalLine.x2}
            y2={lineConfig.verticalLine.y2}
            stroke="white"
            strokeWidth="1"
            opacity="0.3"
          />
        )}
        {lineConfig.circle && (
          <circle 
            cx={lineConfig.circle.cx}
            cy={lineConfig.circle.cy}
            r="4"
            fill="white"
            opacity="0.5"
          />
        )}
      </svg>
    </div>
  )
}

