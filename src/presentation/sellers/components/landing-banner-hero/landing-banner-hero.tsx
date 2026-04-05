import React from 'react'
import { Image } from '@/presentation/@shared/components/ui/atoms/image'
import { Text } from '@/presentation/@shared/components/ui/atoms/text'
import { useLanguage } from '@/presentation/@shared/hooks/use-language'

const LandingBannerHero = () => {
  const { t } = useLanguage();
  
  return (
          <div className="container position-relative">
            <div className="row align-items-center landing-banner">
              <div className="col-12 col-lg-6 position-relative z-1 landing-banner-cont">
                <Image className='landing-banner-img' src="/landing-img.svg" alt="landing-banner" />
              </div>
              <div className="col-lg-6 position-relative landing-text-cont">
                <Text variant='h4'>{t.sellers.sellFastEasy}</Text>
                <Text variant='p' className='fw-light my-3'>{t.sellers.createStoreSteps}</Text>
                <ul>
                  <li>
                    <Image src="/tilde.svg" width={20} height={20} alt="icon" />
                    <Text variant='p'>{t.sellers.loginOrRegister}</Text>
                  </li>
                  <li>
                    <Image src="/tilde.svg" width={20} height={20} alt="icon" />
                    <Text variant='p'>{t.sellers.choosePlan}</Text>
                  </li>
                  <li>
                    <Image src="/tilde.svg" width={20} height={20} alt="icon" />
                    <Text variant='p'>{t.sellers.configureStore}</Text>
                  </li>
                  <li>
                    <Image src="/tilde.svg" width={20} height={20} alt="icon" />
                    <Text variant='p'>{t.sellers.startSelling}</Text>
                  </li>
                </ul>
              </div>
            </div>
          </div>
  )
}

export default LandingBannerHero