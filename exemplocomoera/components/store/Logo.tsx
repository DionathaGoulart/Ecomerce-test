import Image from 'next/image'

export default function Logo() {
  return (
    <Image
      src="/Logotipo.svg"
      alt="Logo"
      width={113}
      height={41}
      className="h-10 w-auto"
      priority
    />
  )
}

