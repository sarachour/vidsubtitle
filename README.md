6.831: Ui Project (Name TBD)
=============

### Getting Started

##### Required Packages 
+ Python

+ Google Chrome

+ Second Browser Here

##### Recommended Programs

+ __For Mac__:

   + _Mou_: A realtime Markdown editor. The Github wiki and read pages follow the markdown format.
   
   + _Sublime_: Minimalistic text editor for web programming.
   
 + __For Linux__:
   + _Retext_: A realtime Markdown editor. The Github wiki and read pages follow the markdown format.
   
   + _Sublime_: Minimalistic text editor for web programming.

##### Setting up the environment
To set up the environment, navigate to the project directory in a bash terminal, and run:

	source ./env.sh
	
You can add this to _~/.bashrc_ if you want the command to run automatically.

##### Testing the Website
from the root directory, do the following:

	cd srv
	./server.sh

This will launch a dummy filehost. You can access the website in the _site_ subdirectory by visiting:

	127.0.0.1:8080/index.html
	
__For Chrome__: Before starting development, make sure to  disable caching. If you do not do this, your changes will not be visible.

   1. Go to _settings -> more tools -> console_
   2. Click the settings icon on the console.
   3. Check _Disable Cache (While Devtools is Open)_
   4. Scroll down and click _Save_
   
### Style Guidelines
Ignore this for now.
TODO: i'll hook in the _jshint_ style checker as a git commit hook to prevent badly format javascript/css from being pushed. 

