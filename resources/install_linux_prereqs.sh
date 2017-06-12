if hash apt-get 2>/dev/null; then
    if hash sudo 2>/dev/null; then
      sudo apt-get update
      sudo apt-get install python-libtorrent python-cherrypy3 vlc browser-plugin-vlc python-flask python-requests python-setuptools
      sudo easy_install pip
      sudo pip install requests==2.5.0
      sudo pip install pyminifier
      sudo pip install pyinstaller
      sudo pip install xmlrunner
      sudo pip install blinker
      sudo pip install raven
    fi
elif hash yum 2>/dev/null; then
    if hash sudo 2>/dev/null; then
      sudo rpm -ivh http://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-stable.noarch.rpm
      sudo yum update
      sudo yum install vlc mozilla-vlc python-pip.noarch rb_libtorrent-python.x86_64 python-cherrypy.noarch python-flask.noarch tar
      sudo pip install requests==2.5.0
      sudo pip install pyminifier
      sudo pip install pyinstaller
      sudo pip install xmlrunner
      sudo pip install blinker
      sudo pip install raven
    fi
fi
