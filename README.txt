Unzip folder contents

requirements
Node.JS installation of 20.x or above is required to run this program.

1. Configure config.js 
	- ip_subnet_pre -> the first 3 sections of the subnet
	- ip_range -> 1-255, can assume (1) and (2) from ip_subnet_pre as parent element
	- ping_try_count -> not required to modify
	- excluded_IP -> array element, follow syntax to add excluded IP addresses
2. cd %PATH/TO/DIRECTORY%   <- eg cd E:/path/dir
3. cd %DRIVE_LOCATION%:    <- eg E:
4. run "node index.js"
5. Generated output should be exported to .txt with timestamp
