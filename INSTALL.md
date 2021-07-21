# Installation

## Configure RaspberryPI 0-W gadget mode

### Install the OS

First step is to configure the PI so that it will be visible by the GoTek & FlashFloppy.

I advise you do this with a fresh installation
of [Raspberry PI OS Lite](https://www.raspberrypi.org/software/operating-systems/) and an SD card of 8Gb size minimum.
If you have a large collection of disk images then the larger the card is the better.

There is no point in using a desktop image as the PI will be used headless and it'll just use up space as well as more
memory - the PI0 only has 512MiB.

Follow the standard instructions for installing the OS, just ensure that you have it configured with:

* Filesystem expanded to fill the entire card
* SSH enabled
* Connected to your WiFi network

### Enable the USB driver

Next, we need to enable the USB driver which provides the gadget modes, by editing two configuration files.

    sudo nano /boot/config.txt

Scroll to the bottom and append the line below:

    dtoverlay=dwc2

Press CTRL+O followed by Enter to save, and then CTRL+X to quit.

    sudo nano /etc/modules

Append the line below:

    dwc2

### Create the container volume

Now we need to create the volume that will appear to the GoTek/FlashFloppy.

To do this we will create a 2GiB file to hold our disk images.
This file will then be formatted with the FAT32 filesystem then mounted as a drive so we can write to it.

Note: change count=2048 to a larger value if you have room, e.g. 8192 for an 8GiB drive or 16384 for a 16GiB drive.
Just don't use up all of the free space as you need some for the OS and the UI.

    sudo dd bs=1M if=/dev/zero of=/piusb.bin count=2048
    sudo mkdosfs /piusb.bin -F 32 -I
    sudo mkdir /mnt/usb_share

Next we need to edit fstab so this volume will be mounted on boot:

    sudo nano /etc/fstab

Then append the following at the end of that file:

    /piusb.bin /mnt/usb_share vfat users,umask=000 0 2

Finally run:

    sudo mount -a
    df -h

You should now see a drive mount under /mnt/usb_share appear which is where your disk images will be hosted.

For example:

    pi@ida:/mnt/usb_share $ df -h
    Filesystem      Size  Used Avail Use% Mounted on
    /dev/root        59G   18G   39G  31% /
    devtmpfs        183M     0  183M   0% /dev
    tmpfs           216M     0  216M   0% /dev/shm
    tmpfs           216M  3.1M  213M   2% /run
    tmpfs           5.0M     0  5.0M   0% /run/lock
    tmpfs           216M     0  216M   0% /sys/fs/cgroup
    /dev/mmcblk0p1  253M   48M  205M  19% /boot
    tmpfs            44M     0   44M   0% /run/user/1000
    /dev/loop0       16G  8.0K   16G   1% /mnt/usb_share

