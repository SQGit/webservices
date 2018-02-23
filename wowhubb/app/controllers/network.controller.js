const httpStatus = require('http-status');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const { intersectionWith, isEqual } = require('lodash');

const ObjectId = mongoose.Types.ObjectId;


/* exports.friendsuggestion = async (req, res, next) => {
  const id = req.user._id;
  const { search } = req.body;

  let friend;
  let sent;
  let received;

  let splitted = '';

  function words() {
    const parts = search.split(' ');

    for (let i = 0; i < parts.length; i += 1) {
      splitted += parts[i];

      if (i < parts.length - 1) {
        splitted += '|';
      }
    }

    return splitted;
  }

  words();

  const reg = new RegExp(splitted, 'gi');

  const list = await User.find({ firstname: reg }, { firstname: 1,
    lastname: 1,
    wowtagid: 1,
    personalimage: 1,
    designation: 1,
    friendrequestsent: 1,
    friendrequestreceived: 1,
    friends: 1,
    place: 1 }).lean();


  function final() {
    for (let i = 0; i < list.length; i += 1) {
      friend = !!(String(list[i].friends)).includes(String(id));
      sent = !!(String(list[i].friendrequestsent)).includes(String(id));
      received = !!(String(list[i].friendrequestreceived)).includes(String(id));
      delete list[i].friends;
      delete list[i].friendrequestsent;
      delete list[i].friendrequestreceived;

      if ((friend || sent || received) === false) {
        list[i].status = 'add friend';
      } else if (sent === true) {
        list[i].status = 'received';
      } else if (received === true) {
        list[i].status = 'request sent';
      } else if (friend === true) {
        list[i].status = 'friend';
      }
    }
  }

  final();

  const result = list.filter(x => String(x._id) !== String(id));

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: result,
  });
}; */

/* Deprecated friend suggestion

exports.friendsuggestion2 = async (req, res, next) => {
  const id = req.user._id;
  const { search } = req.body;

  let friend;
  let sent;
  let received;

  let splitted = '';

  function words() {
    const parts = search.split(' ');

    for (let i = 0; i < parts.length; i += 1) {
      splitted += parts[i];

      if (i < parts.length - 1) {
        splitted += '|';
      }
    }

    return splitted;
  }

  words();

  const reg = new RegExp(splitted, 'gi');

  const list = await User.find({ firstname: reg }, { firstname: 1,
    lastname: 1,
    wowtagid: 1,
    personalimage: 1,
    designation: 1,
    friendrequestsent: 1,
    friendrequestreceived: 1,
    friends: 1,
    place: 1 }).lean();


  function final() {
    for (let i = 0; i < list.length; i += 1) {
      friend = !!(String(list[i].friends)).includes(String(id));
      sent = !!(String(list[i].friendrequestsent)).includes(String(id));
      received = !!(String(list[i].friendrequestreceived)).includes(String(id));
      delete list[i].friends;
      delete list[i].friendrequestsent;
      delete list[i].friendrequestreceived;

      if ((friend || sent || received) === false) {
        list[i].status = 'add friend';
      } else if (sent === true) {
        list[i].status = 'received';
      } else if (received === true) {
        list[i].status = 'request sent';
      } else if (friend === true) {
        delete list[i];
      }
    }
  }

  final();

  const result = list.filter(x => String(x._id) !== String(id));

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: result,
  });
}; */

exports.sendrequest = async (req, res, next) => {
  const id = req.user._id;
  const { userid } = req.body;

  let status = '';

  const checkfriends = await User.find({ _id: id, friends: ObjectId(userid) });
  const checkreceived = await User.find({ _id: id, friendrequestreceived: ObjectId(userid) });
  const checksent = await User.find({ _id: id, friendrequestsent: ObjectId(userid) });


  if ((checkfriends.length) >= 1) {
    status = 'friend';
  } else if ((checksent.length) >= 1) {
    status = 'sent';
  } else if ((checkreceived.length) >= 1) {
    status = 'received';
  }

  if (status === 'friend') {
    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'You are friends already',
    });
  } else if (status === 'sent') {
    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'Request already sent',
    });
  } else if (status === 'received') {
    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'You received a request from this user already',
    });
  }

  await User.findByIdAndUpdate(id, { $push: { friendrequestsent: userid } }); // send
  await User.findByIdAndUpdate(userid, { $push: { friendrequestreceived: id } }); // receive

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: 'Friend Request has been sent',
  });
};

/*  Deprecated send Request


exports.sendrequest2 = async (req, res, next) => {
  const id = req.user._id;
  const { userid } = req.body;

  const check = await User.find({ friendrequestsent: { $in: [userid] } });

  // const check = await User.find({$or: [{friendrequestsent: 
  { $in: [userid] },friends: { $in: [userid] }}]});

  let analyze = false;

  if (check.length !== 0) {
    for (let i = 0; i < check.length; i += 1) {
      if (String(check[i]._id) === String(id)) {
        analyze = true;
      }
    }
  }

  if (analyze === true) {
    return res.json({
      success: false,
      code: httpStatus.OK,
      message: 'Request already sent',
    });
  }
  await User.findByIdAndUpdate(id, { $push: { friendrequestsent: userid } }); // send
  await User.findByIdAndUpdate(userid, { $push: { friendrequestreceived: id } }); // receive

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: 'Friend Request has been sent',
  });
};
*/

// exports.declinerequest = async (req, res, next) => {
//   const id = req.user._id;
//   const { userid } = req.body;

//   const check = await User.find({ friendrequestreceived: { $in: [userid] } });

//   let analyze = false;

//   if (check.length !== 0) {
//     for (let i = 0; i < check.length; i += 1) {
//       if (String(check[i]._id) === String(id)) {
//         analyze = true;
//       }
//     }
//   }

//   if (analyze === true) {
//     await User.findByIdAndUpdate(id, { $pull: { friendrequestreceived: userid } }); // received
//     await User.findByIdAndUpdate(userid, { $pull: { friendrequestsent: id } }); // sent

//     return res.json({
//       success: true,
//       code: httpStatus.OK,
//       message: 'Friend Request has been declined',
//     });
//   }

//   return res.json({
//     success: false,
//     code: httpStatus.OK,
//     message: 'Invalid Request',
//   });
// };

exports.declinerequest = async (req, res, next) => {
  const id = req.user._id;
  const { userid } = req.body;

  const checkreceived = await User.find({ _id: id, friendrequestreceived: ObjectId(userid) });

  if (checkreceived.length === 0) {
    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'Invalid Request',
    });
  }

  await User.findByIdAndUpdate(id, { $pull: { friendrequestreceived: userid } }); // received
  await User.findByIdAndUpdate(userid, { $pull: { friendrequestsent: id } }); // sent

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: 'Friend Request has been declined',
  });
};


exports.acceptrequest = async (req, res, next) => {
  const id = req.user._id;
  const { userid } = req.body;

  const checkreceived = await User.find({ _id: id, friendrequestreceived: ObjectId(userid) });

  if (checkreceived.length === 0) {
    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'Invalid Request',
    });
  }


  await User.findByIdAndUpdate(id, { $push: { friends: userid } }); // receiver
  await User.findByIdAndUpdate(userid, { $push: { friends: id } }); // sender

  await User.findByIdAndUpdate(id, { $pull: { friendrequestreceived: userid } }); // receiver
  await User.findByIdAndUpdate(userid, { $pull: { friendrequestsent: id } }); // sender


  return res.json({
    success: true,
    code: httpStatus.OK,
    message: 'Friend Request has been accepted',
  });
};


exports.mutual = async (req, res, next) => {
  const id = req.user._id;

  /*  const mutual = await User.findById(id)
    .populate({
      path: 'friendrequestreceived',
      select: 'friends._id',
      // populate: { path: 'friends' },
    }); */

  const ownFriends = await User.findById(id, { friends: 1 });
  // const receivedSugFriends = await User.findById(id, { friendrequestreceived: 1 });
  const receivedSugFriends = await User.findById(id)
    .populate({
      path: 'friendrequestreceived',
      select: 'friends',
      // populate: { path: 'friends' },
    })
    .lean();

  console.log(receivedSugFriends.friendrequestreceived.length);


  function mutualProcess() {
    for (let i = 0; i < receivedSugFriends.friendrequestreceived.length; i += 1) {
      // console.log(ownFriends.friends,receivedSugFriends.friendrequestreceived[i].friends)

      // _.intersectionWith(a, b, _.isEqual)

      receivedSugFriends.friendrequestreceived[i].friends =
      intersectionWith(ownFriends.friends,
        receivedSugFriends.friendrequestreceived[i].friends, isEqual);
    }
  }

  mutualProcess();


  return res.json({
    success: true,
    code: httpStatus.OK,
    ownFriends,
    receivedSugFriends,
  });
};


/* =========================== */


exports.friendsuggestion = async (req, res, next) => {
  const id = req.user._id;
  const { search } = req.body;

  const ownFriends = await User.findById(id, { friends: 1 });

  let friend;
  let sent;
  let received;

  let splitted = '';

  function words() {
    const parts = search.split(' ');

    for (let i = 0; i < parts.length; i += 1) {
      splitted += parts[i];

      if (i < parts.length - 1) {
        splitted += '|';
      }
    }

    return splitted;
  }

  words();

  const reg = new RegExp(splitted, 'gi');

  const list = await User.find({ firstname: reg }, { firstname: 1,
    lastname: 1,
    wowtagid: 1,
    personalimage: 1,
    designation: 1,
    friendrequestsent: 1,
    friendrequestreceived: 1,
    friends: 1,
    place: 1 })
    // .populate('friends', 'wowtagid personalimage firstname lastname designation friends')
    .lean();

  function final() {
    for (let i = 0; i < list.length; i += 1) {
      friend = !!(String(list[i].friends)).includes(String(id));
      sent = !!(String(list[i].friendrequestsent)).includes(String(id));
      received = !!(String(list[i].friendrequestreceived)).includes(String(id));


      const mutualfriendsArray = [];
      for (let j = 0; j < (list[i].friends).length; j += 1) {
        mutualfriendsArray.push(list[i].friends[j]);
      }

      list[i].mutualfriends = intersectionWith(ownFriends.friends, mutualfriendsArray, isEqual);
      list[i].mutualfriendscount = (list[i].mutualfriends).length;


      /*   //Mutual Friends of Friends 
      
      for(let j=0;j<list[i].friends.length; j+=1){
        list[i].friends[j].friends = intersectionWith(ownFriends.friends,
          list[i].friends[j].friends,isEqual)
        list[i].friends[j].mutualfriends = (list[i].friends[j].friends).length - 1;
      }

      //Mutual Friends of Sent Request

      for(let j=0;j<list[i].friendrequestsent.length; j+=1){
        list[i].friendrequestsent[j].friends = intersectionWith(ownFriends.friends,
          list[i].friendrequestsent[j].friends,isEqual)
        list[i].friendrequestsent[j].mutualfriends = (list[i].friendrequestsent[j].friends).length;
      }

      //Mutual Friends of Received Request

      for(let j=0;j<list[i].friendrequestreceived.length; j+=1){
        list[i].friendrequestreceived[j].friends = intersectionWith(ownFriends.friends,
          list[i].friendrequestreceived[j].friends,isEqual)
        list[i].friendrequestreceived[j].mutualfriends = 
        (list[i].friendrequestreceived[j].friends).length;
      } */

      delete list[i].friends;
      delete list[i].friendrequestsent;
      delete list[i].friendrequestreceived;


      if ((friend || sent || received) === false) {
        list[i].status = 'add friend';
      } else if (sent === true) {
        list[i].status = 'received';
      } else if (received === true) {
        list[i].status = 'request sent';
      } else if (friend === true) {
        list[i].status = 'friend';
      }
    }
  }

  final();

  const result = list.filter(x => String(x._id) !== String(id));

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: result,
  });
};


/* BACKUP ONLY */

exports.friendsuggestionbackup = async (req, res, next) => {
  const id = req.user._id;
  const { search } = req.body;

  const ownFriends = await User.findById(id, { friends: 1 });

  let friend;
  let sent;
  let received;

  let splitted = '';

  function words() {
    const parts = search.split(' ');

    for (let i = 0; i < parts.length; i += 1) {
      splitted += parts[i];

      if (i < parts.length - 1) {
        splitted += '|';
      }
    }

    return splitted;
  }

  words();

  const reg = new RegExp(splitted, 'gi');

  const list = await User.find({ firstname: reg }, { firstname: 1,
    lastname: 1,
    wowtagid: 1,
    personalimage: 1,
    designation: 1,
    friendrequestsent: 1,
    friendrequestreceived: 1,
    friends: 1,
    place: 1 })
    // .populate('friends', 'wowtagid personalimage firstname lastname designation friends')
    .lean();


  function final() {
    for (let i = 0; i < list.length; i += 1) {
      friend = !!(String(list[i].friends)).includes(String(id));
      sent = !!(String(list[i].friendrequestsent)).includes(String(id));
      received = !!(String(list[i].friendrequestreceived)).includes(String(id));

      console.log(friend);
      console.log(sent);
      console.log(received);

      const friendsArray = [];
      for (let j = 0; j < (list[i].friends).length; j += 1) {
        friendsArray.push(list[i].friends[j]._id);
      }

      list[i].friends = intersectionWith(ownFriends.friends, friendsArray, isEqual);
      list[i].mutualfriends = (list[i].friends).length;


      /*   //Mutual Friends of Friends 
      
      for(let j=0;j<list[i].friends.length; j+=1){
        list[i].friends[j].friends = intersectionWith(ownFriends.friends,
          list[i].friends[j].friends,isEqual)
        list[i].friends[j].mutualfriends = (list[i].friends[j].friends).length - 1;
      }

      //Mutual Friends of Sent Request

      for(let j=0;j<list[i].friendrequestsent.length; j+=1){
        list[i].friendrequestsent[j].friends = intersectionWith(ownFriends.friends,
          list[i].friendrequestsent[j].friends,isEqual)
        list[i].friendrequestsent[j].mutualfriends = (list[i].friendrequestsent[j].friends).length;
      }

      //Mutual Friends of Received Request

      for(let j=0;j<list[i].friendrequestreceived.length; j+=1){
        list[i].friendrequestreceived[j].friends = intersectionWith(ownFriends.friends,
          list[i].friendrequestreceived[j].friends,isEqual)
        list[i].friendrequestreceived[j].mutualfriends = 
        (list[i].friendrequestreceived[j].friends).length;
      } */

      // delete list[i].friends;
      delete list[i].friendrequestsent;
      delete list[i].friendrequestreceived;


      if ((friend || sent || received) === false) {
        list[i].status = 'add friend';
      } else if (sent === true) {
        list[i].status = 'received';
      } else if (received === true) {
        list[i].status = 'request sent';
      } else if (friend === true) {
        list[i].status = 'friend';
      }
    }
  }

  final();

  const result = list.filter(x => String(x._id) !== String(id));

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: result,
  });
};

