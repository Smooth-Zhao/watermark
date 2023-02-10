
import NikonLogo from '@/assets/logo/nikon.png'
import SonyLogo from '@/assets/logo/sony.png'
import FujifilmLogo from '@/assets/logo/fujifilm.png'
import AppleLogo from '@/assets/logo/apple.png'

const logo = {
    nikon: NikonLogo,
    sony: SonyLogo,
    fujifilm: FujifilmLogo,
    apple: AppleLogo,
}

export default function getLogo(make = ''){
  make = make.toLowerCase()
  if (make.includes('nikon')) {
    return logo.nikon
  } else if (make.includes('sony')) {
    return logo.sony
  } else if (make.includes('fujifilm')) {
    return logo.fujifilm
  } else if (make.includes('apple')) {
    return logo.apple
  } else {
    return ''
  }
}
