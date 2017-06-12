if hash apt-get 2>/dev/null; then
    if hash sudo 2>/dev/null; then
      sudo apt-get update
      sudo apt-get install vlc browser-plugin-vlc
    fi
elif hash yum 2>/dev/null; then
    if hash sudo 2>/dev/null; then
      sudo rpm -ivh http://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-stable.noarch.rpm
      sudo yum update
      sudo yum install vlc mozilla-vlc
    fi
fi
sudo mkdir /usr/local/bin/donutglaze
sudo cp -r ./templates /usr/local/bin/donutglaze/.
sudo cp -r ./static /usr/local/bin/donutglaze/.
sudo cp ./Donutglaze /usr/local/bin/donutglaze/donutglaze
sudo cp ./dht_bootstrap /usr/local/bin/donutglaze/dht_bootstrap
sudo cp ./logo256.png /usr/local/bin/donutglaze/.
sudo mkdir /usr/local/bin/donutglaze/tmp
sudo chmod -R a+w /usr/local/bin/donutglaze/tmp
sudo cp ./Donutglaze.desktop /usr/share/applications/Donutglaze.desktop
sudo cp ./Donutglaze.desktop ~/.local/share/applications/Donutglaze.desktop
sudo chmod +x ~/.local/share/applications/Donutglaze.desktop
xdg-mime default Donutglaze.desktop application/bittorrent
xdg-mime default Donutglaze.desktop x-scheme-handler/magnet
gconftool-2 -s /desktop/gnome/url-handlers/magnet/command '/usr/local/bin/donutglaze/donutglaze %s' --type String
gconftool-2 -s /desktop/gnome/url-handlers/magnet/enabled --type Boolean true
gvfs-mime --set application/x-bittorrent Donutglaze.desktop
gvfs-mime --set x-scheme-handler/magnet Donutglaze.desktop
