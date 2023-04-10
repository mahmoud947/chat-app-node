const asyncHandler = require('express-async-handler')
const terms = asyncHandler(async (req, res) => {
  res.status(200).json({
    About_Our_Services: [
      {
        title: 'About Our Services',
        subTitle:
          "Privacy And Security Principles. Since we started GoChat, we've built our Services with strong privacy and security principles in mind",
      },
      {
        title: 'Connecting You With Other People',
        subTitle:
          'We provide, and always strive to improve, ways for you to communicate with other GoChat users including through messages, voice and video calls, sending images and video, showing your status, and sharing your location with others when you choose. We may provide a convenient platform that enables you to send and receive money to or from other users across our platform. GoChat works with partners, service providers, and affiliated companies to help us provide ways for you to connect with their services.',
      },
      {
        title: 'Ways To Improve Our Services.',
        subTitle:
          'We analyze how you make use of GoChat, in order to improve our Services, including helping businesses who use GoChat measure the effectiveness and distribution of their services and messages. GoChat uses the information it has and also works with partners, service providers, and affiliated companies to do this',
      },
      {
        title: 'Safety, Security, And Integrity',
        subTitle:
          'We work to protect the safety, security, and integrity of our Services. This includes appropriately dealing with abusive people and activity violating our Terms. We work to prohibit misuse of our Services including harmful conduct towards others, violations of our Terms and policies, and address situations where we may be able to help support or protect our community. If we learn of people or activity like this, we will take appropriate action, including by removing such people or activity or contacting law enforcement. Any such removal will be in accordance with the',
      },
      {
        title: 'Enabling Access To Our Services',
        subTitle:
          'To operate our global Services, we need to store and distribute content and information in data centers and systems around the world, including outside your country of residence. The use of this global infrastructure is necessary and essential to provide our Services. This infrastructure may be owned or operated by our service providers including affiliated companies.',
      },
      {
        title: 'Age',
        subTitle:
          'You must be at least 13 years old to register for and use our Services (or such greater age required in your country or territory for you to be authorized to register for and use our Services without parental approval). In addition to being of the minimum required age to use our Services under applicable law, if you are not old enough to have authority to agree to our Terms in your country or territory, your parent or guardian must agree to our Terms on your behalf. Please ask your parent or guardian to read these Terms with you.',
      },
    ],
  })
})

module.exports = { terms }
