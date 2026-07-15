<script lang="ts">
  import VideoModal from './VideoModal.svelte';
  
  // Hero section converted from Figma specs to Svelte 5
  // Mobile implementation added based on Frame 18 specs.
  
  let isVideoModalOpen = $state(false);
</script>

<div class="relative w-full flex justify-center py-[30px] lg:pt-20 lg:pb-0 lg:px-6">
  <div class="flex flex-col lg:flex-row items-center gap-12 lg:justify-between w-full max-w-[1440px] h-auto lg:h-[449px]">
    
    <!-- Left Section: Content & Actions (Frame 16) -->
    <div class="flex flex-col items-start gap-[30px] w-full">
      <!-- Mobile View (Frame 18 Specs) -->
      <div class="flex lg:hidden flex-col items-center gap-[16px] w-full xs:max-w-full  max-w-[383px] mx-auto text-center" style="font-family: 'Test Söhne', -apple-system, sans-serif;">
        <!-- Heading -->
        <div class="min-h-[86px] flex items-center justify-center">
          <h1 class="text-[#4267AD] text-[34px] xs:text-4xl font-semibold leading-[43px] drop-shadow-[0_0_0_rgba(56,64,112,0.25)]">
            Turn Conversations <span class="text-[#F47B20] ">into Booked Work</span>
          </h1>
        </div>

        <!-- Description & Action Area (Frame 16) -->
        <div class="flex flex-col items-center gap-[16px] w-full mt-4">
          <p class="text-[#1F2A44]  text-[18px] leading-[30px] p-0 m-0 font-sohne">
            AI captures calls, messages, and <br/> website inquiries — automatically <br/> turning customer interest <br/> into booked work.
          </p>
          <p class="text-[#1F2A44] font-semibold font-sohne lg:font-medium text-[16px] font-sohne leading-[30px] p-0 m-0">
            More Engagement. Faster responses.<br/>More booked work
          </p>
          
          <!-- Buttons (Frame 17) -->
          <div class="flex flex-col items-center gap-[16px] w-full pt-4">
            <button 
              onclick={() => window.open('/revenue-model-layer1', '_blank')}
              class="w-[318px] max-w-full h-[70px] bg-[#F47B20] shadow-[0px_2px_6px_rgba(244,123,32,0.3)] rounded-[40px] text-white font-bold text-center text-[20px] leading-[25px] cursor-pointer"
            >
              Explore the ClearSky<br/>Growth Engine
            </button>
            <button 
              onclick={() => isVideoModalOpen = true}
              class="w-[318px] max-w-full h-[70px] border-2 border-[#F47B20] rounded-[40px] flex items-center justify-center gap-4 bg-transparent text-[#F47B20] font-bold text-[20px] leading-[25px] cursor-pointer"
            >
              <div class="w-[34px] h-[34px] flex items-center justify-center">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <path d="M14.62 0.539118C15.3632 0.184202 16.1764 0 17 0C17.8236 0 18.6368 0.184202 19.38 0.539118C20.0334 0.85258 20.6322 1.36341 21.4697 2.07823L21.6008 2.18769C22.3968 2.86769 23.1581 3.18944 24.2212 3.27403L24.3904 3.2873C25.4883 3.3752 26.2728 3.43656 26.9561 3.67871C27.7327 3.95308 28.4382 4.39767 29.0207 4.97994C29.6033 5.5622 30.0482 6.26739 30.3229 7.04386C30.5634 7.72717 30.6248 8.51166 30.7127 9.6096L30.726 9.77877C30.8106 10.8419 31.134 11.6032 31.8123 12.3992L31.9218 12.5286C32.6366 13.3678 33.1491 13.9666 33.4609 14.62C33.8158 15.3632 34 16.1764 34 17C34 17.8236 33.8158 18.6368 33.4609 19.38C33.1474 20.0334 32.6366 20.6322 31.9218 21.4697L31.8123 21.6008C31.119 22.4134 30.8089 23.178 30.726 24.2212L30.7127 24.3904C30.6248 25.4883 30.5634 26.2728 30.3213 26.9561C30.0469 27.7327 29.6023 28.4382 29.0201 29.0207C28.4378 29.6033 27.7326 30.0482 26.9561 30.3229C26.2728 30.5634 25.4883 30.6248 24.3904 30.7127L24.2212 30.726C23.1581 30.8106 22.3968 31.134 21.6008 31.8123L21.4697 31.9218C20.6322 32.6366 20.0334 33.1491 19.38 33.4609C18.6368 33.8158 17.8236 34 17 34C16.1764 34 15.3632 33.8158 14.62 33.4609C13.9666 33.1474 13.3678 32.6366 12.5303 31.9218L12.3992 31.8123C11.6761 31.1605 10.751 30.7769 9.77877 30.726L9.6096 30.7127C8.51166 30.6248 7.72717 30.5634 7.04386 30.3213C6.26725 30.0469 5.56185 29.6023 4.97929 29.0201C4.39674 28.4378 3.9518 27.7326 3.67705 26.9561C3.43656 26.2728 3.3752 25.4883 3.2873 24.3904L3.27403 24.2212C3.22305 23.249 2.83952 22.3239 2.18769 21.6008L2.07823 21.4697C1.36341 20.6322 0.850921 20.0334 0.539118 19.38C0.184202 18.6368 0 17.8236 0 17C0 16.1764 0.184202 15.3632 0.539118 14.62C0.85258 13.9666 1.36341 13.3678 2.07823 12.5303L2.18769 12.3992C2.83952 11.6761 3.22305 10.751 3.27403 9.77877L3.2873 9.6096C3.3752 8.51166 3.43656 7.72717 3.67871 7.04386C3.95308 6.26725 4.39767 5.56185 4.97994 4.97929C5.5622 4.39674 6.26739 3.9518 7.04386 3.67705C7.72717 3.43656 8.51166 3.3752 9.6096 3.2873L9.77877 3.27403C10.751 3.22305 11.6761 2.83952 12.3992 2.18769L12.5286 2.07823C13.3678 1.36341 13.9666 0.850921 14.62 0.539118ZM17.9205 12.5369C17.4362 12.2417 16.9254 11.9299 16.461 11.764C16.1514 11.6455 15.82 11.5946 15.4891 11.6148C15.1088 11.6442 14.7449 11.7824 14.4409 12.0128C13.8306 12.4739 13.605 13.1273 13.4972 13.6879C13.396 14.2087 13.3579 14.8671 13.3164 15.5853L13.3114 15.6616C13.2866 16.1193 13.2683 16.5787 13.2683 17C13.2683 17.4213 13.2849 17.8807 13.3114 18.3384L13.3114 18.4147C13.3579 19.1329 13.396 19.7913 13.4972 20.3137C13.605 20.8727 13.8289 21.5261 14.4425 21.9855C14.7411 22.2111 15.0927 22.3554 15.4874 22.3836C15.8606 22.4118 16.194 22.3322 16.4626 22.2343C16.9237 22.0685 17.4362 21.7583 17.9205 21.4631L18.0001 21.4133C18.6476 21.0245 19.2647 20.587 19.846 20.1048L19.9124 20.05C20.4116 19.6437 20.9058 19.2407 21.2574 18.831C21.6787 18.3417 21.9756 17.7563 21.9756 17C21.9756 16.2437 21.677 15.6582 21.2574 15.169C20.9058 14.7593 20.4116 14.3563 19.914 13.95L19.8477 13.8952C19.5351 13.6375 19.2131 13.3913 18.8824 13.1572C18.5944 12.9572 18.3002 12.7664 18.0001 12.585L17.9205 12.5369Z" fill="#F47B20"/>
                </svg>
              </div>
              <span>Watch Video</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop View (Untouched Design) -->
      <div class="hidden lg:flex flex-col items-start gap-8 lg:gap-[85px] w-full">
        <!-- Text Content Area (Frame 1000006074) -->
        <div class="flex flex-col items-start gap-[33px] w-full">
          <!-- Heading (Frame 12) -->
          <div class="flex items-center gap-2.5 w-full lg:w-[509px]">
            <h1 class="text-[#4267AD] font-inter text-[48px] leading-[58px] font-bold drop-shadow-[0_0_0_rgba(56,64,112,0.25)]">
              Turn Conversations <span class="text-[#F47B20]">into Booked Work</span>
            </h1>
          </div>
          
          <!-- Subtext (Frame 13) -->
          <div class="flex items-center gap-2.5 w-full">
            <p class="text-[#1F2A44] font-playpen text-[24px] leading-[34px] font-medium max-w-[713px]">
              AI captures calls, messages, and website inquiries — <br/> automatically turning customer interest into booked work.
            </p>
          </div>
          
          <!-- Tagline (Frame 15) -->
          <div class="flex items-center gap-2.5 w-full">
            <p class="text-[#1F2A44] font-playpen text-[26px] leading-[40px] font-semibold whitespace-nowrap lg:max-w-none">
              More Engagement. Faster responses. More booked work
            </p>
          </div>
        </div>

        <!-- Call to Action Buttons (Frame 17) -->
        <div class="flex flex-wrap items-start gap-4">
          <!-- Primary CTA (Frame 9) -->
          <button 
            onclick={() => window.open('/revenue-model-layer1', '_blank')}
            class="flex justify-center items-center px-4 py-2.5 gap-2.5 w-[235px] h-[70px] bg-[#F47B20] shadow-[0px_2px_6px_rgba(244,123,32,0.3)] rounded-[40px] transition-transform hover:scale-105 cursor-pointer"
          >
            <span class="text-white font-inter text-base font-semibold leading-[19px] text-center px-4">
              Explore the ClearSky Growth Engine
            </span>
          </button>
                <!-- Secondary CTA: Watch Video (Frame 16) -->
          <button 
            onclick={() => isVideoModalOpen = true}
            class="flex justify-center items-center px-5 py-4 gap-4 w-[190px] h-[70px] rounded-[40px] group"
          >
            <div class="w-[34px] h-[34px] flex items-center justify-center transition-colors ">
             <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.62 0.539118C15.3632 0.184202 16.1764 0 17 0C17.8236 0 18.6368 0.184202 19.38 0.539118C20.0334 0.85258 20.6322 1.36341 21.4697 2.07823L21.6008 2.18769C22.3968 2.86769 23.1581 3.18944 24.2212 3.27403L24.3904 3.2873C25.4883 3.3752 26.2728 3.43656 26.9561 3.67871C27.7327 3.95308 28.4382 4.39767 29.0207 4.97994C29.6033 5.5622 30.0482 6.26739 30.3229 7.04386C30.5634 7.72717 30.6248 8.51166 30.7127 9.6096L30.726 9.77877C30.8106 10.8419 31.134 11.6032 31.8123 12.3992L31.9218 12.5286C32.6366 13.3678 33.1491 13.9666 33.4609 14.62C33.8158 15.3632 34 16.1764 34 17C34 17.8236 33.8158 18.6368 33.4609 19.38C33.1474 20.0334 32.6366 20.6322 31.9218 21.4697L31.8123 21.6008C31.119 22.4134 30.8089 23.178 30.726 24.2212L30.7127 24.3904C30.6248 25.4883 30.5634 26.2728 30.3213 26.9561C30.0469 27.7327 29.6023 28.4382 29.0201 29.0207C28.4378 29.6033 27.7326 30.0482 26.9561 30.3229C26.2728 30.5634 25.4883 30.6248 24.3904 30.7127L24.2212 30.726C23.1581 30.8106 22.3968 31.134 21.6008 31.8123L21.4697 31.9218C20.6322 32.6366 20.0334 33.1491 19.38 33.4609C18.6368 33.8158 17.8236 34 17 34C16.1764 34 15.3632 33.8158 14.62 33.4609C13.9666 33.1474 13.3678 32.6366 12.5303 31.9218L12.3992 31.8123C11.6761 31.1605 10.751 30.7769 9.77877 30.726L9.6096 30.7127C8.51166 30.6248 7.72717 30.5634 7.04386 30.3213C6.26725 30.0469 5.56185 29.6023 4.97929 29.0201C4.39674 28.4378 3.9518 27.7326 3.67705 26.9561C3.43656 26.2728 3.3752 25.4883 3.2873 24.3904L3.27403 24.2212C3.22305 23.249 2.83952 22.3239 2.18769 21.6008L2.07823 21.4697C1.36341 20.6322 0.850921 20.0334 0.539118 19.38C0.184202 18.6368 0 17.8236 0 17C0 16.1764 0.184202 15.3632 0.539118 14.62C0.85258 13.9666 1.36341 13.3678 2.07823 12.5303L2.18769 12.3992C2.83952 11.6761 3.22305 10.751 3.27403 9.77877L3.2873 9.6096C3.3752 8.51166 3.43656 7.72717 3.67871 7.04386C3.95308 6.26725 4.39767 5.56185 4.97994 4.97929C5.5622 4.39674 6.26739 3.9518 7.04386 3.67705C7.72717 3.43656 8.51166 3.3752 9.6096 3.2873L9.77877 3.27403C10.751 3.22305 11.6761 2.83952 12.3992 2.18769L12.5286 2.07823C13.3678 1.36341 13.9666 0.850921 14.62 0.539118ZM17.9205 12.5369C17.4362 12.2417 16.9254 11.9299 16.461 11.764C16.1514 11.6455 15.82 11.5946 15.4891 11.6148C15.1088 11.6442 14.7449 11.7824 14.4409 12.0128C13.8306 12.4739 13.605 13.1273 13.4972 13.6879C13.396 14.2087 13.3579 14.8671 13.3164 15.5853L13.3114 15.6616C13.2866 16.1193 13.2683 16.5787 13.2683 17C13.2683 17.4213 13.2849 17.8807 13.3114 18.3384L13.3114 18.4147C13.3579 19.1329 13.396 19.7913 13.4972 20.3137C13.605 20.8727 13.8289 21.5261 14.4425 21.9855C14.7411 22.2111 15.0927 22.3554 15.4874 22.3836C15.8606 22.4118 16.194 22.3322 16.4626 22.2343C16.9237 22.0685 17.4362 21.7583 17.9205 21.4631L18.0001 21.4133C18.6476 21.0245 19.2647 20.587 19.846 20.1048L19.9124 20.05C20.4116 19.6437 20.9058 19.2407 21.2574 18.831C21.6787 18.3417 21.9756 17.7563 21.9756 17C21.9756 16.2437 21.677 15.6582 21.2574 15.169C20.9058 14.7593 20.4116 14.3563 19.914 13.95L19.8477 13.8952C19.5351 13.6375 19.2131 13.3913 18.8824 13.1572C18.5944 12.9572 18.3002 12.7664 18.0001 12.585L17.9205 12.5369Z" fill="#F47B20"/>
</svg>
            </div>
            <span class="text-[#F47B20] font-inter text-base font-semibold leading-[19px] text-center">
              Watch Video
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Right Section: Visualization (Frame 30) -->
    <div class="lg:flex justify-end items-end w-full lg:w-[377px] h-[449px] relative hidden">
      <!-- Info Cards Column (Frame 1000006070) -->
      <div class="flex flex-col justify-end items-end gap-[17px] w-[310px] h-full absolute lg:relative z-10 lg:mr-[-180px]">
        
        <!-- Communication Card (Frame 21) -->
        <div class="flex items-center px-4 py-2.5 gap-2.5 w-[250px] h-[43.86px] bg-white border-[1.5px] border-[rgba(31,42,68,0.8)] shadow-[0px_4px_13px_rgba(0,0,0,0.07)] rounded-[30px]">
          <div class="w-6 h-6 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_3482_232)">
<path d="M15.0791 0.00683594C15.3748 0.0360431 15.6533 0.165954 15.8652 0.376953C16.1073 0.618044 16.2432 0.945272 16.2432 1.28613V3.32227H18.0254C18.7105 3.32227 19.3681 3.59298 19.8525 4.0752C20.3369 4.55735 20.6083 5.21169 20.6084 5.89355V7.66992H22.708C23.0506 7.66992 23.3789 7.80576 23.6211 8.04688C23.8633 8.28799 24 8.61509 24 8.95605C23.9999 9.29689 23.8632 9.62422 23.6211 9.86523C23.3789 10.1061 23.0504 10.2412 22.708 10.2412H20.6074V13.5498H22.708C23.0506 13.5498 23.3789 13.6856 23.6211 13.9268C23.8633 14.1679 24 14.4949 24 14.8359C23.9999 15.1768 23.8632 15.5041 23.6211 15.7451C23.3789 15.986 23.0504 16.1211 22.708 16.1211H20.6074V17.8926C20.6073 18.5744 20.3349 19.2288 19.8506 19.7109C19.3662 20.1931 18.7085 20.4639 18.0234 20.4639H16.2451V22.5771C16.2451 22.9181 16.1084 23.2452 15.8662 23.4863C15.624 23.7274 15.2956 23.8633 14.9531 23.8633C14.6106 23.8632 14.2822 23.7274 14.04 23.4863C13.7978 23.2452 13.6621 22.9181 13.6621 22.5771V20.4639H10.3379V22.5771C10.3379 22.918 10.202 23.2452 9.95996 23.4863C9.71774 23.7274 9.38845 23.8633 9.0459 23.8633C8.70351 23.8632 8.37492 23.7273 8.13281 23.4863C7.89071 23.2452 7.75488 22.918 7.75488 22.5771V20.4639H5.97266C5.2876 20.4639 4.62994 20.1931 4.14551 19.7109C3.66116 19.2288 3.38878 18.5744 3.38867 17.8926V16.1191H1.29199C0.949438 16.1191 0.620152 15.9843 0.37793 15.7432C0.135804 15.5021 2.33362e-05 15.1749 0 14.834C0 14.4931 0.135838 14.1659 0.37793 13.9248C0.620152 13.6837 0.949438 13.5479 1.29199 13.5479H3.38867V10.2393H1.29199C0.949438 10.2393 0.620152 10.1044 0.37793 9.86328C0.135796 9.62222 5.45334e-05 9.29499 0 8.9541C0 8.61323 0.135875 8.28601 0.37793 8.04492C0.620152 7.8038 0.949438 7.66797 1.29199 7.66797H3.38867V5.89551C3.3887 5.21358 3.66111 4.55936 4.14551 4.07715C4.62995 3.59491 5.28755 3.32422 5.97266 3.32422H7.75488V1.28613C7.75488 0.945246 7.89073 0.61805 8.13281 0.376953C8.37492 0.135945 8.70351 0.000123915 9.0459 0C9.38845 0 9.71774 0.135835 9.95996 0.376953C10.202 0.618048 10.3379 0.945254 10.3379 1.28613V3.32227H13.6621V1.28613C13.6621 0.945174 13.7979 0.618064 14.04 0.376953C14.2822 0.135874 14.6106 4.35147e-05 14.9531 0L15.0791 0.00683594ZM9.49512 8.72754L6.97363 16H8.62891L9.1709 14.3418H11.8086L12.3496 16H14.0049L11.4863 8.72754H9.49512ZM14.8828 16H16.4277V8.72754H14.8828V16ZM10.5195 10.3896L11.417 13.1416H9.5625L10.4619 10.3896H10.5195Z" fill="#1F2A44" fill-opacity="0.8"/>
</g>
<defs>
<clipPath id="clip0_3482_232">
<rect width="24" height="23.8633" fill="white"/>
</clipPath>
</defs>
</svg>

          </div>
          <p class="text-[rgba(31,42,68,0.8)] font-inter text-[12px] leading-[15px] font-bold">
            AI Communication
          </p>
        </div>

        <!-- CEO Info Card (Frame 22) -->
        <div class="flex items-center px-4 py-2.5 gap-2.5 w-[273px] h-[65px] bg-white border-[1.5px] border-[rgba(31,42,68,0.8)] shadow-[0px_4px_13px_rgba(0,0,0,0.07)] rounded-[30px]">
          <p class="w-[105px] text-[rgba(31,42,68,0.8)] font-inter text-[12px] leading-[15px] font-normal">
            George Harison CEO Doing it Right 705-265-1212
          </p>
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-[#07C00E] rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <path d="M9.16 11.25c-.46 0-1.1-.17-2.06-.71-1.17-.65-2.07-1.26-3.24-2.42C2.74 7 2.19 6.28 1.43 4.89 .57 3.32 .71 2.49 .88 2.14 1.07 1.72 1.36 1.47 1.74 1.22 1.95 1.08 2.17 .96 2.41 .86c.02-.01 .04-.02 .06-.03 .12-.05 .29-.13 .52-.05 .15 .06 .28 .17 .49 .38 .42 .42 1 1.35 1.21 1.81 .15 .31 .25 .51 .25 .74s-.14.41-.3.63c-.03.04-.06.08-.09.12-.18.23-.22.3-.19.42 .05.24.44.96 1.08 1.6 .64.64 1.34 1 1.59 1.05 .12.03 .19-.01.43-.2.03-.02.07-.05.11-.08 .25-.18 .45-.32.71-.32h.01c.23 0 .42.1 .75.26 .42.21 1.38.79 1.8 1.21 .21.21.32.34.38.49 .08.23 0 .4-.05.52l-.03.06c-.1.24-.22.46-.36.67-.25.37-.5.66-.92.86-.22.1-.46.15-.7.15z"/>
              </svg>
            </div>
            <div class="w-6 h-6 bg-[#F40001] rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <path d="M9.16 11.25c-.46 0-1.1-.17-2.06-.71-1.17-.65-2.07-1.26-3.24-2.42C2.74 7 2.19 6.28 1.43 4.89 .57 3.32 .71 2.49 .88 2.14 1.07 1.72 1.36 1.47 1.74 1.22 1.95 1.08 2.17 .96 2.41 .86c.02-.01 .04-.02 .06-.03 .12-.05 .29-.13 .52-.05 .15 .06 .28 .17 .49 .38 .42 .42 1 1.35 1.21 1.81 .15 .31 .25 .51 .25 .74s-.14.41-.3.63c-.03.04-.06.08-.09.12-.18.23-.22.3-.19.42 .05.24.44.96 1.08 1.6 .64.64 1.34 1 1.59 1.05 .12.03 .19-.01.43-.2.03-.02.07-.05.11-.08 .25-.18 .45-.32.71-.32h.01c.23 0 .42.1 .75.26 .42.21 1.38.79 1.8 1.21 .21.21.32.34.38.49 .08.23 0 .4-.05.52l-.03.06c-.1.24-.22.46-.36.67-.25.37-.5.66-.92.86-.22.1-.46.15-.7.15z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Quote Request Card (Frame 23) -->
        <div class="flex items-center px-4 py-2.5 gap-2.5 w-[266px] h-[65px] bg-white border-[1.5px] border-[rgba(31,42,68,0.8)] shadow-[0px_4px_13px_rgba(0,0,0,0.07)] rounded-[30px]">
          <p class="w-[151px] text-[rgba(31,42,68,0.8)] font-inter text-[12px] leading-[15px] font-normal">
            Rodger Davidson Hello, Can I get a quote on From: 705-264-1515
          </p>
          <div class="w-[22px] h-[23px] flex items-center justify-center">
            <svg width="22" height="23" viewBox="0 0 22 23" fill="none">
              <rect width="22" height="23" rx="4" fill="#4267AD"/>
            </svg>
          </div>
        </div>

        <!-- AI Chat History Card (Frame 24) -->
        <div class="flex justify-end items-start px-4 py-2.5 gap-2.5 w-[310px] h-[167px] bg-white border-[1.5px] border-[rgba(31,42,68,0.8)] shadow-[0px_4px_13px_rgba(0,0,0,0.07)] rounded-[30px]">
          <div class="flex flex-col justify-center items-start gap-1 w-[239px]">
            <div class="text-[#131217] font-inter text-[12px] leading-[15px]  w-[230px]">
              <div class="font-semibold">New Contact:</div> Jenna Smith, I would like to book an appointment next Thursday
            </div>
            <div class="text-[#131217] font-inter text-[12px] leading-[15px] ">
              <div class="font-semibold">Response from AI:</div> Appointment is set for Thursday 9:15 AM
            </div>
            <div class="text-[#131217] font-inter text-[12px] leading-[15px] text-nowrap">
              <div class="font-semibold">Response from AI:</div> Would you prefer mornings or afternoons?
            </div>
            <div class="text-[#131217] font-inter text-[12px] leading-[15px] ">
              <div class="font-semibold">Jenna Smith:</div> I prefer mornings
            </div>
          </div>
          <div class="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z" fill="#F47B20"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Hero Visual Image -->
      <img
        src="/woman-hero.png"
        class="w-[247px] h-[449px] object-cover  transition-all duration-700 hover:brightness-110 z-10"
        alt="AI Analysis"
      />
    </div>

  </div>
</div>

<VideoModal bind:open={isVideoModalOpen} videoId="EDQ3xZKlMC8" />

<style>
  /* Optional: Smooth fade-in for the hero contents if reveal classes aren't enough */
  :global(.reveal-active) .relative {
    animation: fadeIn 0.8s ease-out forwards;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
