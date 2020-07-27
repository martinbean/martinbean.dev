---
excerpt: How to create static model instances for the purpose of SwiftUI previews.
title: Test models for SwiftUI previews
twitter_card_type: summary_large_image
twitter_card_image: /img/posts/2020-07-27-test-models-for-swiftui-previews/twitter-card-image.jpg
---
In my spare time, I’m currently building an iOS app for a video on demand platform I operate, [Your Fight Site VOD][1].
I’m using SwiftUI and absolutely _love_ its declarative way of building iOS apps.

Having worked a lot with component-based JavaScript frameworks such as [Vue.js][2] I’m accustomed to small, discreet components that can be reused and composed to make up larger views. In this vein, my app has a `VideoListItem` view. This view represents a single row in a list of videos:

```swift
struct VideoListView: View {
  var video: Video

  var body: some View {
    NavigationLink(destination: VideoDetailsView()) {
      Text(video.name)
        .fontWeight(.bold)
    }
  }
}
```

The above is a simplified version of the actual view, but it shows the video details, and when tapped navigates the user to the view the details of that particular video. The important thing to note is that the view requires a well-formed `Video` struct instance.

SwiftUI also offers the ability to “preview” views directly in Xcode without the need for using the device simulator or running on a physical device. However, if the view you’re previewing requires data, so in turn do the previews.

Instead of retrieving data over the network for the purpose of previews, I’ve taken to defining static `test` methods in my structs:

```swift
struct Video: Identifiable {
  let id: UUID
  let name: String
}

extension Video {
  static func test() -> Video {
    self.init(id: UUID(), name: "Test Video")
  }
}
```

I can then use these `test` methods to populate previews with well-defined instances of my application’s models:

```swift
struct VideoListView_Previews: PreviewProvider {
  static var previews: some View {
    VideoListView(video: .test())
  }
}
```

Swift is pretty clever in that it infers the `video` argument takes a `Video` instance, so therefore I can call methods (such as `test`) using the shorthand notation seen above. Nice!

[1]: https://vod.yourfightsite.com/
[2]: https//vuejs.org/
