<div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern 
                id="islamicPatternDense" 
                x="80"
                y="0"
                width="57"
                height="57"
                patternUnits="userSpaceOnUse"
                patternTransform="scale(0.7)"
              >
                <g>
                  {/* المربع الخلفي للباترن */}
                  <path 
                    d="M0,0 L57,0 L57,57 L0,57 Z" 
                    fill={colors.secondary} 
                    opacity="0.1"
                  />
                  
                  {/* الشكل الإسلامي الرئيسي (النجمة الثمانية) */}
                  <path 
                    d="M27,4 L31,5 L34,8 L34,22 L48,22 L53,27 L51,31 L48,34 L34,34 L34,48 L28,53 L23,48 L23,34 L9,34 L4,29 L6,25 L9,22 L23,22 L23,8 Z" 
                    fill={colors.background} 
                    opacity="0.8"
                  />
                  
                  {/* الزاوية السفلية اليسار */}
                  <path 
                    d="M0,33 L6,38 L17,39 L18,50 L24,57 L0,57 Z" 
                    fill={colors.background} 
                    opacity="1"
                  />
                  
                  {/* الزاوية السفلية اليمين */}
                  <path 
                    d="M56,33 L57,33 L57,57 L34,57 L40,50 L41,39 L52,38 Z" 
                    fill={colors.background} 
                    opacity="1"
                  />
                  
                  {/* الزاوية العلوية اليمين */}
                  <path 
                    d="M34,0 L57,0 L57,23 L51,18 L40,17 L39,6 Z" 
                    fill={colors.background} 
                    opacity="1"
                  />
                  
                  {/* الزاوية العلوية اليسار */}
                  <path 
                    d="M0,0 L23,0 L18,6 L17,17 L6,18 L0,23 Z" 
                    fill={colors.background} 
                    opacity="1"
                  />
                </g>
              </pattern>
            </defs>
            
            {/* المستطيل اللي بيطبق الباترن على كل المساحة */}
            <rect width="100%" height="100%" fill="url(#islamicPatternDense)" />
          </svg>
        </div>
