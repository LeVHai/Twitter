
export const UserVeryfyStatus = {
    Unverified : 'Unverified', // chưa xác thực mail ,mặc định = 0
    Veryfied:'Veryfied', // đã xác thực email
    Banned:'Banned' // Bị khoá
  }
export class User{
    constructor(user) {
        this._id = user._id
        this.name = user.name || ''
        this.email = user.email
        this.date_of_birth = user.date_of_birth || new Date()
        this.password = user.password
        this.create_at = user.create_at || new Date()
        this.update_at = user.update_at || new Date()
        this.email_verify_token = user.email_verify_token || ''
        this.forgot_password_token = user.forgot_password_token || ''
        this.verify = user.verify || UserVeryfyStatus.Unverified
        this.twitter_circle = user.twitter_circle || []
        this.bio = user.bio || ''
        this.location = user.location || ''
        this.website = user.website || ''
        this.username = user.username || ''
        this.avatar = user.avatar || ''
        this.cover_photo = user.cover_photo || ''
      }
}