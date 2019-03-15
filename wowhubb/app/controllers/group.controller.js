const httpStatus = require('http-status');
const Group = require('../models/group.model');
const User = require('../models/user.model');
const moment = require('moment');
const { intersection } = require('lodash');

const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;


/* admin */

exports.creategroup = async (req, res, next) => {
  try {
    const id = req.user._id;

    const userArray = [];
    const { groupname, users, privacy } = req.body;
    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    const adminIncludedArray = [...users, id];

    const group = await new Group({
      adminid: id,
      groupname,
      privacy,
      createdAt,
    }).save();

    const groupid = group._id;

    if (users !== undefined) {
      for (let i = 0; i < adminIncludedArray.length; i += 1) {
        userArray.push(Group.findByIdAndUpdate(groupid, { $push: { users: { userid: adminIncludedArray[i] } } },
          { safe: true, upsert: true, new: true }));
      }

      await Promise.all(userArray);
    }

    const result = await Group.findById(groupid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: result,
    });
  } catch (error) {
    return next(error);
  }
};


exports.fetchgroups = async (req, res, next) => {
  try {
    const id = req.user._id;

    const result = await Group.find({ 'users.userid': id }, {})
      .populate('adminid', 'wowtagid personalimageurl firstname lastname designation')
      .populate('users.userid', 'wowtagid personalimageurl firstname lastname designation');

    const groups = result.sort((a, b) => {
      const keyA = new Date(a.createdAt);
      const keyB = new Date(b.createdAt);
      if (keyA < keyB) return 1;
      if (keyA > keyB) return -1;
      return 0;
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      groups,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchemailwithwowtag = async (req, res, next) => {
  try {
    const { email } = req.body;

    const fetchemail = await User.findOne({ email });

    if (!fetchemail) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Email not found',
      });
    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: fetchemail.wowtagid,
    });
  } catch (error) {
    return next(error);
  }
};

/* exports.fetchphonewithwowtag = async (req, res, next) => {
  try {
    const { phone } = req.body;

    let phoneArray = [];
    let result = [];

    if(phone !== undefined){
      for(let i=0;i<phone.length;i+=1){
        phoneArray.push(await User.findOne({phone: phone[i]}))
      }
      await Promise.all(phoneArray)
    }

    phoneArray.map((p,i) => {

      let phone = '';
      let wowtagid = '';

      if(p !== null){
        phone = p.phone
        wowtagid = p.wowtagid        
      }else{
        wowtagid = "null"
      }

      result.push({phone,wowtagid})
    })
    

    // const fetchphone = await User.findOne({ phone });

    // if (!fetchphone) {
    //   return res.json({
    //     success: false,
    //     code: httpStatus.NOT_FOUND,
    //     message: 'Phone not found',
    //   });
    // }

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: result,
    });
  } catch (error) {
    return next(error);
  }
}; */

exports.fetchphonewithwowtag = async (req, res, next) => {
  try {
    const { phonewithid } = req.body;

    const phoneArray = [];
    const result = [];

    if (phonewithid !== undefined) {
      for (let i = 0; i < phonewithid.length; i += 1) {
        // phoneArray.push(await User.findOne({phone: phonewithid[i].phone}))
        const fetchphone = await User.findOne({ phone: phonewithid[i].phone });


        if (!fetchphone) {
          const params = {
            phone: phonewithid[i].phone,
            id: phonewithid[i].id,
            contactname: phonewithid[i].contactname,
            wowtagid: 'null',
          };

          phoneArray.push(params);
        } else {
          const params = {
            phone: phonewithid[i].phone,
            id: phonewithid[i].id,
            contactname: phonewithid[i].contactname,
            wowtagid: fetchphone.wowtagid,
          };

          phoneArray.push(params);
        }
      }
      await Promise.all(phoneArray);
    }


    return res.json({
      success: true,
      code: httpStatus.OK,
      message: phoneArray,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchparticulargroup = async (req, res, next) => {
  try {
    const id = req.user._id;

    const { groupid } = req.body;

    const group = await Group.findById(groupid, {})
      .populate('adminid', 'wowtagid personalimageurl firstname lastname designation')
      .populate('users.userid', 'wowtagid personalimageurl firstname lastname designation');

    return res.json({
      success: true,
      code: httpStatus.OK,
      group,
    });
  } catch (error) {
    return next(error);
  }
};

/* admin */

exports.editgroup = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { groupid, groupname, privacy } = req.body;

    const checkadmin = await Group.findById(groupid, { adminid: 1, users: 1 });

    if (String(checkadmin.adminid) === String(id)) {
      await Group.findByIdAndUpdate(groupid, { $set: { groupname, privacy } });

      const result = await Group.findById(groupid, {});

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: result,
      });
    }

    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'You dont have permission to change!',
    });
  } catch (error) {
    return next(error);
  }
};

/* admin */

exports.addusers = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { users, groupid } = req.body;

    const checkadmin = await Group.findById(groupid, { adminid: 1, users: 1 });

    // console.log(users)

    const groupUsers = [];

    function filterGroups() {
      for (let i = 0; i < checkadmin.users.length; i += 1) {
        groupUsers.push(String(checkadmin.users[i].userid));
      }
    }

    filterGroups();

    // console.log(groupUsers)

    const userArray = [];

    function intersect() {
      for (let i = 0; i < users.length; i += 1) {
        if (intersection([users[i]], groupUsers).length === 0) {
          userArray.push(users[i]);
        }
      }
    }

    intersect();

    // console.log(userArray);

    const finalArray = [];


    if (String(checkadmin.adminid) === String(id)) {
      if (users !== undefined) {
        for (let i = 0; i < userArray.length; i += 1) {
          finalArray.push(Group.update(groupid, { $addToSet: { users: { userid: userArray[i] } } },
            { safe: true, upsert: true, new: true }));
        }

        await Promise.all(finalArray);
      }

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'Users has been added',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'You dont have permission to change!',
    });
  } catch (error) {
    return next(error);
  }
};

/* admin */

exports.deletegroup = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { groupid } = req.body;

    const checkadmin = await Group.findById(groupid, { adminid: 1, users: 1 });

    if (String(checkadmin.adminid) === String(id)) {
      await Group.findByIdAndRemove(groupid, {});

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'Group has been deleted',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'You dont have permission to delete group!',
    });
  } catch (error) {
    return next(error);
  }
};

