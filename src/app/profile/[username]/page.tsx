import React from 'react'

const ProfilePage = ({params} : { params: { username: string } }) => {
  console.log("username : ", params)
  return (
    <div>ProfilePage</div>
  )
}

export default ProfilePage