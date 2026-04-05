import React from 'react'
import { Image } from '@/presentation/@shared/components/ui/atoms/image'
import { useLanguage } from '@/presentation/@shared/hooks/use-language'

const LandingBannerHelp = () => {
  const { t } = useLanguage();
  
  return (
          <div className='row'>
            <div className='col-12 col-lg-5 landing-banner-text'>
              <h4>{t.sellers.needHelp}</h4>
              <h5>{t.sellers.queriesImportant}</h5>
              <ul>
                <li>
                  <Image src="/arroba.svg" alt="icon" width={50} height={50} />
                  <div>
                    <h5>{t.sellers.emailSupport}</h5>
                    <p>{t.sellers.emailSupportDesc}</p>
                  </div>
                </li>
                <li>
                  <Image src="/tag.svg" alt="icon" width={50} height={50} />
                  <div>
                    <h5>{t.sellers.errorReport}</h5>
                    <p>{t.sellers.errorReportDesc}</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className='col-12 col-lg-7 landing-banner-help'>
              <Image className='banner-img' src="/imagen-completa.png" alt="landing" width={800} height={600} />
            </div>
          </div>
  )
}

export default LandingBannerHelp