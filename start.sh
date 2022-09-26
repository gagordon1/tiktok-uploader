#! /bin/bash
i=0;
while true;
if [ $((i%10))==0 ]
then 
    node pipeliner/src/main.js
fi
do sh ./upload_next.sh;
i=$((i+1))
echo $i
sleep 600;
done

