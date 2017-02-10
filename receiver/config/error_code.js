/**
 * Created by shuyi on 15-8-22.
 */
module.exports = {
  error:{
    'E0001':{
      error_code:'E0001',
      error_type:'error',
      error_msg:'ErrorCode: E0001. ErrorType: error. ErrorMessage: Init redis-buffer error, hset fail.'
    },
    'E0002':{
      error_code:'E0002',
      error_type:'error',
      error_msg:'ErrorCode: E0002. ErrorType: error. ErrorMessage: Redis-buffer error, hget fail.'
    },
    'E0003':{
      error_code:'E0003',
      error_type:'error',
      error_msg:'ErrorCode: E0003. ErrorType: error. ErrorMessage: Redis-buffer error, hdel fail.'
    }
  },

  warning:{
    'W0001':{
      warning_code: 'W0001',
      warning_type:'warning',
      warning_msg:'WarningCode: W0001. WarningType: waring. WarningMessage: Database warning, find nothing.'
    },
    'W0002':{
      warning_code: 'W0002',
      warning_type:'warning',
      warning_msg:'WarningCode: W0002. WarningType: waring. WarningMessage: Database warning, create fail.'
    },
    'W0003':{
      warning_code: 'W0003',
      warning_type:'warning',
      warning_msg:'WarningCode: W0003. WarningType: waring. WarningMessage: Database warning, update fail.'
    },
    'W0004':{
      warning_code: 'W0004',
      warning_type:'warning',
      warning_msg:'WarningCode: W0004. WarningType: waring. WarningMessage: Unsupport event type: '
    }
  }

}